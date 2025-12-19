import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ParentAlert,
  ParentAlertDocument,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from '../schemas/parent-alert.schema';
import { ThreatIncident } from '../schemas/threat-incident.schema';

@Injectable()
export class ParentAlertService {
  constructor(
    @InjectModel(ParentAlert.name)
    private alertModel: Model<ParentAlertDocument>,
  ) {}

  async createThreatAlert(
    parentId: string,
    childId: string,
    incident: ThreatIncident & { _id?: any },
  ): Promise<ParentAlert> {
    const severity =
      incident.severity === 'critical'
        ? AlertSeverity.CRITICAL
        : incident.severity === 'high'
        ? AlertSeverity.WARNING
        : AlertSeverity.INFO;

    const alert = new this.alertModel({
      parentId,
      childId,
      type: AlertType.THREAT_DETECTED,
      severity,
      status: AlertStatus.UNREAD,
      title: `${incident.severity.toUpperCase()}: Potential Threat Detected`,
      message: `A ${incident.severity} severity ${incident.threatType.replace(/_/g, ' ')} was detected in your child's activity.`,
      metadata: {
        threatType: incident.threatType,
        confidence: incident.confidence,
      },
      relatedIncidentId: incident._id?.toString(),
    });

    return await alert.save();
  }

  async createTimeLimitAlert(
    parentId: string,
    childId: string,
    minutesUsed: number,
    limit: number,
  ): Promise<ParentAlert> {
    const alert = new this.alertModel({
      parentId,
      childId,
      type: AlertType.TIME_LIMIT_EXCEEDED,
      severity: AlertSeverity.WARNING,
      status: AlertStatus.UNREAD,
      title: 'Daily Time Limit Reached',
      message: `Your child has reached their daily time limit of ${limit} minutes (${minutesUsed} minutes used today).`,
      metadata: {
        minutesUsed,
        limit,
      },
    });

    return await alert.save();
  }

  async createBlockedContentAlert(
    parentId: string,
    childId: string,
    contentType: string,
    reason: string,
  ): Promise<ParentAlert> {
    const alert = new this.alertModel({
      parentId,
      childId,
      type: AlertType.BLOCKED_CONTENT,
      severity: AlertSeverity.INFO,
      status: AlertStatus.UNREAD,
      title: 'Content Blocked',
      message: `Blocked ${contentType}: ${reason}`,
      metadata: {
        contentType,
        reason,
      },
    });

    return await alert.save();
  }

  async getParentAlerts(
    parentId: string,
    status?: AlertStatus,
    limit = 50,
  ): Promise<ParentAlert[]> {
    const query: any = { parentId };
    if (status) {
      query.status = status;
    }

    return await this.alertModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getUnreadCount(parentId: string): Promise<number> {
    return await this.alertModel.countDocuments({
      parentId,
      status: AlertStatus.UNREAD,
    });
  }

  async markAsRead(alertId: string, parentId: string): Promise<ParentAlert | null> {
    return await this.alertModel
      .findOneAndUpdate(
        { _id: alertId, parentId },
        { status: AlertStatus.READ, readAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async markAllAsRead(parentId: string): Promise<{ modifiedCount: number }> {
    const result = await this.alertModel.updateMany(
      { parentId, status: AlertStatus.UNREAD },
      { status: AlertStatus.READ, readAt: new Date() },
    );

    return { modifiedCount: result.modifiedCount };
  }

  async dismissAlert(alertId: string, parentId: string): Promise<ParentAlert | null> {
    return await this.alertModel
      .findOneAndUpdate(
        { _id: alertId, parentId },
        { status: AlertStatus.DISMISSED, dismissedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async getAlertsByChild(
    parentId: string,
    childId: string,
    limit = 20,
  ): Promise<ParentAlert[]> {
    return await this.alertModel
      .find({ parentId, childId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
