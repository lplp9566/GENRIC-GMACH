import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { YearSummaryPdfStyleData } from './dto';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    attachments?: nodemailer.Attachment[],
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to,
      subject,
      html,
      text,
      attachments,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  }

  async sendYearSummaryPdfStyle(to: string, data: YearSummaryPdfStyleData) {
    const orgName = 'מזכירות הגמ"ח';
    const subject = `דוח סיכום אישי לשנת ${data.year}`;

    const fmt = (n: number) =>
      new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 }).format(n) + ' ₪';

    // ✅ לוגו קבוע מאותה תיקיה: src/modules/.../mail/logo.png
    const logoCid = 'gemach-logo';
  const logoPath = path.join(process.cwd(), 'dist', 'assets', 'logo.png');

    const attachments: nodemailer.Attachment[] = [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: logoCid,
      },
    ];

    const html = `
    <div style="direction:rtl; text-align:right; background:#f2f2f2; padding:24px; font-family: Arial, sans-serif;">
      <div style="max-width:760px; margin:0 auto; background:#fff; border:1px solid #e6e6e6; border-radius:10px; overflow:hidden;">

        <!-- Header -->
        <div style="padding:18px 22px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:14px;">
          <div style="flex:1;">
            <div style="font-size:13px; color:#666;">ד״ס</div>
            <div style="font-size:13px; color:#666;">${new Date().toLocaleDateString('he-IL')}</div>
            <div style="margin-top:6px; font-weight:800; font-size:18px; color:#111;">
              סיכום אישי לשנת ${data.year}
            </div>
          </div>

          <img src="cid:${logoCid}" alt="לוגו" style="height:52px; width:auto; display:block;" />
        </div>

        <!-- Body -->
        <div style="padding:20px 22px;">
          <!-- Member details -->
          <div style="border:1px solid #eee; border-radius:10px; padding:14px; background:#fafafa;">
            <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:14px;">
              <div style="min-width:220px;"><strong>שם:</strong> ${data.memberName}</div>
              ${data.memberId ? `<div style="min-width:220px;"><strong>חבר מס׳:</strong> ${data.memberId}</div>` : ``}
              <div style="min-width:220px;"><strong>תאריך הצטרפות:</strong> ${data.joinedAt}</div>
            </div>
          </div>

          <div style="margin-top:16px; display:grid; grid-template-columns:1fr; gap:12px;">

            ${sectionBox('דמי חבר', [
              row('שולם בשנת ' + data.year, fmt(data.memberFeePaidThisYear)),
              row('שולם דמי חבר (מתאריך ההצטרפות)', fmt(data.memberFeePaidAllTime)),
              row('חוב עבור דמי חבר', fmt(data.memberFeeDebt)),
            ])}

            ${sectionBox('תרומות', [
              row('נתרם בשנת ' + data.year, fmt(data.donatedThisYear)),
              row('סך תרומות', fmt(data.donatedAllTime)),
            ])}

            ${sectionBox('הפקדות', [
              row('הופקד בשנת ' + data.year, fmt(data.depositedThisYear)),
              row('סך הפקדות', fmt(data.depositedAllTime)),
            ])}

            ${sectionBox('הלוואות', [
              row('הלוואה פעילה – סך הכל', fmt(data.activeLoansTotal)),
            ])}
          </div>

          <div style="margin-top:18px; border-top:1px dashed #ddd; padding-top:16px;">
            <div style="font-weight:800; margin-bottom:10px;">נתוני הגמ״ח</div>

            <div style="border:1px solid #eee; border-radius:10px; overflow:hidden;">
              ${kvLine('הון עצמי של הגמ״ח', fmt(data.gemachOwnCapital))}
              ${kvLine('קרן הגמ״ח', fmt(data.gemachMainFund))}
              ${kvLine('דמי חבר', fmt(data.gemachMemberFeesTotal))}
              ${kvLine('תרומות', fmt(data.gemachDonationsTotal))}
              ${typeof data.gemachKohRefund === 'number' ? kvLine('החזר ק״וה', fmt(data.gemachKohRefund)) : ''}

              ${typeof data.depositsFund === 'number' ? kvLine('הפקדות', fmt(data.depositsFund)) : ''}
              ${data['??_fundsTextLine'] ? kvLine('קרנות', String(data['??_fundsTextLine'])) : ''}

              ${kvLine('הוצאות', fmt(data.expensesTotal))}
              ${kvLine('עמלות', fmt(data.expensesCommissions))}
              ${kvLine('פעילות הלוואות', fmt(data.expensesLoansActivity))}
              ${kvLine('השקעות', fmt(data.expensesInvestments))}

              <div style="background:#f6fbff; padding:12px 14px; display:flex; justify-content:space-between; font-weight:900;">
                <div>סך הכל בקופת הגמ״ח</div>
                <div>${fmt(data.cashboxTotal)}</div>
              </div>
            </div>

            <div style="margin-top:14px; font-size:14px;">
              <div>בכבוד רב,</div>
              <div style="font-weight:700;">${orgName}</div>
            </div>

            <div style="margin-top:10px; font-size:12px; color:#888;">
              אם קיבלת את המייל הזה בטעות, אפשר להתעלם ממנו.
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    const text = `סיכום אישי לשנת ${data.year}
שם: ${data.memberName}
תאריך הצטרפות: ${data.joinedAt}

דמי חבר: שולם השנה ${fmt(data.memberFeePaidThisYear)}, מצטבר ${fmt(data.memberFeePaidAllTime)}, חוב ${fmt(data.memberFeeDebt)}
תרומות: השנה ${fmt(data.donatedThisYear)}, מצטבר ${fmt(data.donatedAllTime)}
הפקדות: השנה ${fmt(data.depositedThisYear)}, מצטבר ${fmt(data.depositedAllTime)}
הלוואות פעילות: ${fmt(data.activeLoansTotal)}

בכבוד רב,
${orgName}
`;

    return this.sendMail(to, subject, html, text, attachments);

    function sectionBox(title: string, innerRows: string[]) {
      return `
        <div style="border:1px solid #eee; border-radius:10px; overflow:hidden;">
          <div style="background:#fcfcfc; padding:10px 12px; font-weight:800;">${title}</div>
          <div style="padding:10px 12px;">
            ${innerRows.join('')}
          </div>
        </div>
      `;
    }

    function row(label: string, value: string) {
      return `
        <div style="display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-bottom:1px solid #f1f1f1;">
          <div style="color:#333;">${label}</div>
          <div style="font-weight:700; color:#111; white-space:nowrap;">${value}</div>
        </div>
      `;
    }

    function kvLine(label: string, value: string) {
      return `
        <div style="padding:10px 14px; display:flex; justify-content:space-between; border-bottom:1px solid #f2f2f2;">
          <div style="color:#333;">${label}</div>
          <div style="font-weight:700; color:#111; white-space:nowrap;">${value}</div>
        </div>
      `;
    }
  }
}
