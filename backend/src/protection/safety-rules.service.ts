import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SafetyRule, SafetyRuleDocument } from '../schemas/safety-rule.schema';

export interface CreateSafetyRuleDto {
  childId: string;
  parentId: string;
  timeRestrictions?: {
    enabled: boolean;
    weekdayStart?: string;
    weekdayEnd?: string;
    weekendStart?: string;
    weekendEnd?: string;
    maxDailyMinutes?: number;
  };
  blockedKeywords?: string[];
  blockedUrls?: string[];
  contentFilters?: {
    blockViolence: boolean;
    blockInappropriate: boolean;
    safeSearchOnly: boolean;
  };
  alertSettings?: {
    notifyOnThreat: boolean;
    notifyOnBlockedContent: boolean;
    notifyOnTimeLimit: boolean;
    emailAlerts: boolean;
  };
}

@Injectable()
export class SafetyRulesService {
  constructor(
    @InjectModel(SafetyRule.name)
    private safetyRuleModel: Model<SafetyRuleDocument>,
  ) {}

  async createOrUpdateRules(
    dto: CreateSafetyRuleDto,
  ): Promise<SafetyRule> {
    const existing = await this.safetyRuleModel.findOne({
      childId: dto.childId,
    });

    if (existing) {
      Object.assign(existing, dto);
      return await existing.save();
    }

    const rules = new this.safetyRuleModel(dto);
    return await rules.save();
  }

  async getRules(childId: string): Promise<SafetyRule | null> {
    return await this.safetyRuleModel.findOne({ childId }).exec();
  }

  async checkTimeRestriction(childId: string): Promise<{
    allowed: boolean;
    reason?: string;
    minutesRemaining?: number;
  }> {
    const rules = await this.getRules(childId);

    if (!rules || !rules.timeRestrictions?.enabled) {
      return { allowed: true };
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Check time window
    const start = isWeekend
      ? rules.timeRestrictions.weekendStart
      : rules.timeRestrictions.weekdayStart;
    const end = isWeekend
      ? rules.timeRestrictions.weekendEnd
      : rules.timeRestrictions.weekdayEnd;

    if (start && end) {
      if (currentTime < start || currentTime > end) {
        return {
          allowed: false,
          reason: `Access allowed only between ${start} and ${end}`,
        };
      }
    }

    // TODO: Check daily time limit (requires session tracking)
    // This would need to query ActivityEvent collection for today's usage

    return { allowed: true };
  }

  async isContentBlocked(
    childId: string,
    content: string,
    url?: string,
  ): Promise<{ blocked: boolean; reason?: string }> {
    const rules = await this.getRules(childId);

    if (!rules) {
      return { blocked: false };
    }

    // Check blocked keywords
    if (rules.blockedKeywords && rules.blockedKeywords.length > 0) {
      const contentLower = content.toLowerCase();
      const matchedKeyword = rules.blockedKeywords.find((keyword) =>
        contentLower.includes(keyword.toLowerCase()),
      );

      if (matchedKeyword) {
        return {
          blocked: true,
          reason: `Blocked keyword detected: ${matchedKeyword}`,
        };
      }
    }

    // Check blocked URLs
    if (url && rules.blockedUrls && rules.blockedUrls.length > 0) {
      const matchedUrl = rules.blockedUrls.find((blockedUrl) =>
        url.includes(blockedUrl),
      );

      if (matchedUrl) {
        return {
          blocked: true,
          reason: `Blocked URL: ${matchedUrl}`,
        };
      }
    }

    return { blocked: false };
  }

  async getAllRules(): Promise<SafetyRule[]> {
    return await this.safetyRuleModel.find().exec();
  }

  async deleteRules(childId: string): Promise<void> {
    await this.safetyRuleModel.deleteOne({ childId }).exec();
  }
}
