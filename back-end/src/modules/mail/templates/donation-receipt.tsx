import React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface DonationReceiptEmailProps {
  fullName: string;
  idNumber: string;
  amountText: string;
  fundLabel: string;
  logoUrl?: string;
}

export const DonationReceiptEmail = ({
  fullName,
  idNumber,
  amountText,
  fundLabel,
  logoUrl,
}: DonationReceiptEmailProps) => {
  return (
    <Html lang="he" dir="rtl">
      <Head />
      <Preview>אישור תרומה</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {logoUrl ? (
            <Section style={styles.logoWrap}>
              <Img src={logoUrl} alt="לוגו" style={styles.logo} />
            </Section>
          ) : null}

          <Section style={styles.section}>
            <Text style={styles.greeting}>שלום לך {fullName},</Text>
            <Text style={styles.meta}>מספר זהות: {idNumber}</Text>
            <Text style={styles.line}>
              ברצוננו להודות לך על תרומתך של סך {amountText} ל{fundLabel}.
            </Text>
            <Text style={styles.line}>
              בזכותך הגדלנו את הקרן ונוכל לסייע לעוד משפחות.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: '#f5f5f5',
    margin: 0,
    padding: '24px 0',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '24px 20px',
    borderRadius: '12px',
    border: '1px solid #e9e9e9',
    maxWidth: '600px',
  },
  logoWrap: {
    textAlign: 'center' as const,
    marginBottom: '12px',
  },
  logo: {
    height: '70px',
    width: 'auto',
    display: 'inline-block',
  },
  section: {
    textAlign: 'right' as const,
  },
  greeting: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#111111',
  },
  meta: {
    fontSize: '14px',
    margin: '0 0 16px',
    color: '#444444',
  },
  line: {
    fontSize: '15px',
    margin: '0 0 12px',
    color: '#222222',
    lineHeight: '1.6',
  },
};
