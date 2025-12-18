import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ThreatIncident,
  ThreatSeverity,
  IncidentStatus,
} from '../schemas/threat-incident.schema';
import {
  SafetyRule,
} from '../schemas/safety-rule.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { ParentAlertService } from './parent-alert.service';

@Injectable()
export class ThreatDetectionService {
  // Predefined threat keywords
  private readonly THREAT_KEYWORDS = {
    violence: ['kill', 'hurt', 'weapon', 'fight', 'attack', 'blood'],
    inappropriate: ['sex', 'nude', 'porn', 'xxx', 'adult'],
    cyberbullying: ['hate', 'stupid', 'ugly', 'loser', 'kill yourself'],
    personal_info: ['address', 'phone number', 'credit card', 'password'],
  };

  private readonly EDUCATIONAL_MESSAGES = {
    violence: "Remember, we use kind words here. If someone is being mean, it's best to tell a grown-up you trust.",
    inappropriate: "That content isn't for kids. Let's stick to fun games and stories!",
    cyberbullying: "Being a hero means being kind. If someone makes you feel sad, you can ignore them or talk to your parents.",
    personal_info: "Keep your secrets safe! Never share your phone number or address online without asking your parents first.",
    custom_blocked_content: "This content is blocked to keep our community safe and happy.",
  };

  constructor(
    @InjectModel(ThreatIncident.name)
    private threatModel: Model<ThreatIncident>,
    @InjectModel(SafetyRule.name)
    private safetyRuleModel: Model<SafetyRule>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    private parentAlertService: ParentAlertService,
  ) { }

  async analyzeContent(
    childId: string,
    content: string,
    context: Record<string, any> = {},
  ): Promise<ThreatIncident | null> {
    // Get child's safety rules
    const safetyRule = await this.safetyRuleModel.findOne({ childId }).exec();
    const customKeywords = safetyRule?.blockedKeywords || [];

    // Combine built-in and custom keywords
    const allKeywords = [
      ...Object.values(this.THREAT_KEYWORDS).flat(),
      ...customKeywords,
    ];

    // Check for keyword matches
    const contentLower = content.toLowerCase();
    const detectedKeywords: string[] = [];
    let threatType: string | null = null;
    let severity: ThreatSeverity = ThreatSeverity.LOW;

    // Check each category
    for (const [category, keywords] of Object.entries(this.THREAT_KEYWORDS)) {
      const matches = keywords.filter((keyword) =>
        contentLower.includes(keyword.toLowerCase()),
      );

      if (matches.length > 0) {
        detectedKeywords.push(...matches);
        threatType = category;

        // Determine severity based on category
        if (category === 'violence' || category === 'cyberbullying') {
          severity = ThreatSeverity.HIGH;
        } else if (category === 'inappropriate') {
          severity = ThreatSeverity.MEDIUM;
        }
      }
    }

    // Check custom blocked keywords
    const customMatches = customKeywords.filter((keyword) =>
      contentLower.includes(keyword.toLowerCase()),
    );
    if (customMatches.length > 0) {
      detectedKeywords.push(...customMatches);
      if (!threatType) {
        threatType = 'custom_blocked_content';
      }
    }

    // If threats detected, create incident
    if (detectedKeywords.length > 0 && threatType) {
      const confidence = Math.min(
        100,
        Math.floor((detectedKeywords.length / allKeywords.length) * 100 + 50),
      );

      const incident = new this.threatModel({
        childId,
        threatType,
        severity,
        confidence,
        detectedKeywords,
        context: {
          ...context,
          originalContent: content.substring(0, 500), // Store first 500 chars
        },
        status: IncidentStatus.OPEN,
        parentNotified: false,
      });

      const savedIncident = await incident.save();

      // AC-10.1: Educational Intervention
      const educationalMessage = this.EDUCATIONAL_MESSAGES[threatType as keyof typeof this.EDUCATIONAL_MESSAGES]
        || "Let's keep our play safe and happy!";

      // Attach message to local response for the child
      (savedIncident as any).educationalIntervention = {
        message: educationalMessage,
        options: ['Ignore', 'Block', 'Tell a Parent'],
      };

      // Create parent alert
      try {
        const child = await this.childModel.findById(childId).exec();

        if (child && child.parentId) {
          await this.parentAlertService.createThreatAlert(
            child.parentId.toString(),
            childId,
            savedIncident,
          );

          // Mark as notified
          savedIncident.parentNotified = true;
          await savedIncident.save();
        }
      } catch (error) {
        // Log error but don't fail the whole operation
        console.error('Failed to create parent alert:', error);
      }

      return savedIncident;
    }

    return null;
  }

  async getChildThreats(
    childId: string,
    status?: IncidentStatus,
  ): Promise<ThreatIncident[]> {
    const query: any = { childId };
    if (status) {
      query.status = status;
    }

    return await this.threatModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getAllThreats(filters?: {
    status?: IncidentStatus;
    severity?: ThreatSeverity;
    limit?: number;
  }): Promise<ThreatIncident[]> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.severity) {
      query.severity = filters.severity;
    }

    return await this.threatModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 100)
      .exec();
  }

  async resolveIncident(
    incidentId: string,
    resolvedBy: string,
    resolution: 'resolved' | 'false_positive',
    notes?: string,
  ): Promise<ThreatIncident> {
    const incident = await this.threatModel.findById(incidentId).exec();

    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.status =
      resolution === 'resolved'
        ? IncidentStatus.RESOLVED
        : IncidentStatus.FALSE_POSITIVE;
    incident.resolvedBy = resolvedBy;
    incident.resolvedAt = new Date();
    incident.resolutionNotes = notes;

    return await incident.save();
  }

  async getThreatStats(): Promise<any> {
    const total = await this.threatModel.countDocuments();
    const open = await this.threatModel.countDocuments({
      status: IncidentStatus.OPEN,
    });
    const critical = await this.threatModel.countDocuments({
      severity: ThreatSeverity.CRITICAL,
    });
    const high = await this.threatModel.countDocuments({
      severity: ThreatSeverity.HIGH,
    });

    // Get threats by type
    const byType = await this.threatModel.aggregate([
      { $group: { _id: '$threatType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      open,
      critical,
      high,
      byType,
    };
  }
}
