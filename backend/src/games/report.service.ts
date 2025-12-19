import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChildProfile } from '../schemas/child-profile.schema';
import { GameProgress } from '../schemas/game-progress.schema';
import { ChildBadge } from '../schemas/child-badge.schema';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
    @InjectModel(ChildBadge.name)
    private childBadgeModel: Model<ChildBadge>,
  ) { }

  async generateProgressReport(
    childId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    // Fetch all data
    const child = await this.childModel.findById(childId)
      .populate({
        path: 'parentId',
        populate: { path: 'userId' }
      })
      .exec();

    if (!child) {
      throw new Error('Child not found');
    }

    const query: any = { childId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const progress = await this.progressModel.find(query)
      .populate('gameId')
      .sort({ timesCompleted: -1 })
      .exec();

    const badges = await this.childBadgeModel.find(query)
      .populate('badgeId')
      .sort({ earnedAt: -1 })
      .exec();

    // Create PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#6366f1')
        .text('Play, Learn & Protect', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .fillColor('#000000')
        .text('Progress Report', { align: 'center' })
        .moveDown(2);

      // Child Information
      doc
        .fontSize(14)
        .fillColor('#4b5563')
        .text(`Child: ${child.fullName}`, { continued: false })
        .text(`Age: ${child.age}`, { continued: false })
        .text(`Total Points: ${child.totalPoints}`, { continued: false })
        .text(
          `Report Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        )
        .moveDown(2);

      // Divider
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke('#d1d5db')
        .moveDown(1);

      // Game Progress Section
      doc
        .fontSize(16)
        .fillColor('#6366f1')
        .text('Game Progress', { underline: true })
        .moveDown(1);

      if (progress.length === 0) {
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text('No games played yet.')
          .moveDown(2);
      } else {
        progress.forEach((p: any, index: number) => {
          doc
            .fontSize(13)
            .fillColor('#000000')
            .text(`${index + 1}. ${p.gameId?.title || 'Unknown Game'}`, { continued: false })
            .fontSize(11)
            .fillColor('#4b5563')
            .text(`   High Score: ${p.highScore}`, { continued: false })
            .text(`   Times Completed: ${p.timesCompleted}`, { continued: false })
            .text(`   Current Difficulty: ${p.currentDifficulty}`, {
              continued: false,
            })
            .text(
              `   Last Played: ${new Date(p.lastPlayedAt).toLocaleDateString()}`,
            )
            .moveDown(0.8);
        });
        doc.moveDown(1);
      }

      // Divider
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke('#d1d5db')
        .moveDown(1);

      // Badges Section
      doc
        .fontSize(16)
        .fillColor('#6366f1')
        .text('Badges Earned', { underline: true })
        .moveDown(1);

      if (badges.length === 0) {
        doc
          .fontSize(12)
          .fillColor('#6b7280')
          .text('No badges earned yet. Keep playing to unlock badges!')
          .moveDown(2);
      } else {
        badges.forEach((b: any, index: number) => {
          doc
            .fontSize(13)
            .fillColor('#000000')
            .text(`${index + 1}. ${b.badgeId?.name || 'Unknown Badge'}`, { continued: false })
            .fontSize(11)
            .fillColor('#4b5563')
            .text(`   ${b.badgeId?.description || ''}`, { continued: false })
            .text(
              `   Earned: ${new Date(b.earnedAt).toLocaleDateString()}`,
            )
            .moveDown(0.8);
        });
      }

      // Footer
      doc
        .moveDown(2)
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(
          'This report is generated automatically by Play, Learn & Protect platform.',
          { align: 'center' },
        )
        .text('For more information, visit your parent dashboard.', {
          align: 'center',
        });

      doc.end();
    });
  }
}
