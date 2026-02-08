import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer = require('puppeteer');
import * as os from 'os';
import { HDate } from 'hebcal';
import { DonationReceiptEmailData, YearSummaryPdfStyleData } from './dto';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { DonationReceiptEmail } from './templates/donation-receipt';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private readonly config: ConfigService) {
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
    if (!this.isEmailEnabled()) {
      console.log('[mail] SEND_EMAIL disabled - skipping send');
      return { messageId: 'email-disabled' };
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to,
      subject,
      html,
      text,
      attachments,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  }

  async sendDonationReceipt(data: DonationReceiptEmailData) {
    console.log(data);
    
    const amountText = this.formatCurrency(data.amount);
    const logoUrl = data.logoUrl ?? this.config.get<string>('LOGO_URL');
    const html = await render(
      DonationReceiptEmail({
        fullName: data.fullName,
        idNumber: data.idNumber,
        amountText,
        fundLabel: data.fundLabel,
        logoUrl,
      }),
      { pretty: true },
    );

    const subject = `אישור תרומה - ${amountText}`;
    const text = `שלום לך ${data.fullName}\nמספר זהות: ${data.idNumber}\nברצוננו להודות לך על תרומתך של סך ${amountText} ל${data.fundLabel}.\nבזכותך הגדלנו את הקרן ונוכל לסייע לעוד משפחות.`;

    return this.sendMail(data.to, subject, html, text);
  }

  async sendYearSummaryPdfStyle(to: string, data: YearSummaryPdfStyleData) {
    const subject = `דוח סיכום אישי לשנת ${data.year}`;
    const html = this.buildYearSummaryHtml(data);
    const pdfBuffer = await this.renderHtmlToPdf(html);

    const attachments: nodemailer.Attachment[] = [
      {
        filename: `year-summary-${data.year}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];

    const text = 'מצורף דוח סיכום אישי כקובץ PDF.';
    return this.sendMail(
      to,
      subject,
      '<div style="direction:rtl">מצורף דוח סיכום אישי כקובץ PDF.</div>',
      text,
      attachments,
    );
  }

  private buildYearSummaryHtml(data: YearSummaryPdfStyleData) {
    const orgName = 'מזכירות הגמ"ח';
    const fmt = (n: number) => this.formatCurrency(n);

    const logoDataUrl = this.config.get<string>('LOGO_URL');

    const fontPath = path.join(
      process.cwd(),
      'public',
      'fonts',
      'Heebo-Regular.ttf',
    );
    const fontDataUrl = fs.existsSync(fontPath)
      ? `data:font/ttf;base64,${fs.readFileSync(fontPath).toString('base64')}`
      : '';

    const hebrewDate = new HDate(new Date()).toString('h');

    const memberIdLine = data.memberId
      ? `<div style="min-width:220px;"><strong> תעודת זהות:</strong> ${data.memberId}</div>`
      : '';

    const spouseNameLine = data.spouseName
      ? `<div style="min-width:220px;"><strong>שם בן/בת זוג:</strong> ${data.spouseName}</div>`
      : '';

    const spouseIdLine = data.spouseId
      ? `<div style="min-width:220px;"><strong>תעודת זהות בן/בת זוג:</strong> ${data.spouseId}</div>`
      : '';

    const hebrewJoinedAtLine = data.hebrewJoinedAt
      ? `<div style="min-width:220px;"><strong>תאריך הצטרפות עברי:</strong> ${data.hebrewJoinedAt}</div>`
      : '';

    const loanDebtRow = data.loanDebtTotal > 0
      ? row('חוב בהלוואות', fmt(data.loanDebtTotal))
      : '';

    const standingOrderDebtValue = data.standingOrderReturnDebt ?? 0;
    const standingOrderDebtRow = standingOrderDebtValue > 0
      ? row('חוב בהחזרי הוראת קבע', fmt(standingOrderDebtValue))
      : '';

    const debtRows = [loanDebtRow, standingOrderDebtRow].filter(Boolean);
    const debtsSection = debtRows.length
      ? sectionBox('חובות', debtRows as string[])
      : '';

    return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          ${fontDataUrl ? `@font-face { font-family: 'HeeboEmbed'; src: url('${fontDataUrl}') format('truetype'); font-weight: 400; font-style: normal; }` : ''}
          body, * { font-family: ${fontDataUrl ? "'HeeboEmbed'" : 'Arial'}, sans-serif !important; }
        </style>
      </head>
      <body style="direction:rtl; text-align:right; background:#f2f2f2; padding:24px;">
        <div style="max-width:760px; margin:0 auto; background:#fff; border:1px solid #e6e6e6; border-radius:10px; overflow:hidden;">

          <div style="padding:10px 22px 0; font-size:13px; color:#111; font-weight:700; text-align:right;">בס"ד</div>

          <div style="padding:18px 22px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:14px;">
            <div style="flex:1;">
              <div style="font-size:13px; color:#666;">תאריך</div>
              <div style="font-size:13px; color:#666;">${data.reportDate}</div>
              <div style="font-size:13px; color:#666;">תאריך עברי: ${hebrewDate}</div>
              <div style="margin-top:6px; font-weight:800; font-size:18px; color:#111;">
                סיכום אישי לשנת ${data.year}
              </div>
            </div>

            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="לוגו" style="height:52px; width:auto; display:block;" />` : ''}
          </div>

          <div style="padding:20px 22px;">
            <div style="border:1px solid #eee; border-radius:10px; padding:14px; background:#fafafa;">
              <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:14px;">
                <div style="min-width:220px;"><strong>שם:</strong> ${data.memberName}</div>
                ${memberIdLine}
                <div style="min-width:220px;"><strong>תאריך הצטרפות:</strong> ${data.joinedAt}</div>
                ${hebrewJoinedAtLine}
                ${spouseNameLine}
                ${spouseIdLine}
              </div>
            </div>

            <div style="margin-top:16px; display:grid; grid-template-columns:1fr; gap:12px;">

              ${sectionBox(
                'דמי חבר',
                [
                  row('שולם בשנת ' + data.year, fmt(data.memberFeePaidThisYear)),
                  row(
                    'שולם דמי חבר (מתאריך ההצטרפות)',
                    fmt(data.memberFeePaidAllTime)
                  ),
                  data.memberFeeDebt > 0
                    ? row('חוב עבור דמי חבר', fmt(data.memberFeeDebt))
                    : '',
                ].filter(Boolean) as string[]
              )}

              ${sectionBox('תרומות', [
                row('נתרם בשנת ' + data.year, fmt(data.donatedThisYear)),
                row('סך תרומות', fmt(data.donatedAllTime)),
              ])}

              ${sectionBox('הפקדות', [
                row('הופקד בשנת ' + data.year, fmt(data.depositedThisYear)),
                row('סך הפקדות', fmt(data.depositedAllTime)),
              ])}

              ${data.activeLoansTotal > 0
                ? sectionBox('הלוואות', [
                    row('יתרה להחזר בהלוואות', fmt(data.activeLoansTotal)),
                    row(
                      'סך הלוואות שלקחת',
                      `${data.totalLoansTakenCount} על סך ${fmt(
                        data.totalLoansTakenAmount,
                      )}`,
                    ),
                  ])
                : ''}

              ${debtsSection}
            </div>

            <div style="margin-top:14px; font-size:14px;">
              <div>בכבוד רב,</div>
              <div style="font-weight:700;">${orgName}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

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
  }

  private async renderHtmlToPdf(html: string): Promise<Buffer> {
    const candidatePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.PUPPETEER_CHROME_PATH ||
      this.resolveChromeFromCache() ||
      puppeteer.executablePath();
      
    const executablePath =
      candidatePath && fs.existsSync(candidatePath) ? candidatePath : undefined;
    if (candidatePath) {
      console.log(
        `[pdf] candidatePath=${candidatePath} exists=${Boolean(executablePath)}`,
      );
    } else {
      console.log('[pdf] candidatePath is undefined');
    }
    const browser = await puppeteer.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });
      return Buffer.from(pdfBytes);
    } finally {
      await browser.close();
    }
  }

  private resolveChromeFromCache(): string | undefined {
    const cacheDir =
      process.env.PUPPETEER_CACHE_DIR ||
      path.join(os.homedir(), '.cache', 'puppeteer');
    if (!fs.existsSync(cacheDir)) return undefined;

    const chromeRoot = path.join(cacheDir, 'chrome');
    if (!fs.existsSync(chromeRoot)) return undefined;

    const platforms = [
      ['linux', 'chrome-linux64', 'chrome'],
      ['linux', 'chrome-linux', 'chrome'],
      ['linux-arm64', 'chrome-linux64', 'chrome'],
    ];

    const versions = fs
      .readdirSync(chromeRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const version of versions) {
      for (const [platform, dirName, exeName] of platforms) {
        const candidate = path.join(chromeRoot, version, platform, dirName, exeName);
        if (fs.existsSync(candidate)) return candidate;
      }
    }

    return undefined;
  }

  private isEmailEnabled(): boolean {
    const raw =
      this.config.get<string>('SEND_EMAIL') ?? process.env.SEND_EMAIL ?? '';
    return String(raw).trim().toLowerCase() === 'true';
  }

  private formatCurrency(value: number) {
    return (
      new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 }).format(value) +
      ' ₪'
    );
  }
}
