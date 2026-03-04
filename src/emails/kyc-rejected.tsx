import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface KycRejectedEmailProps {
  recipientName: string
  companyName: string
  rejectionReason: string
}

export default function KycRejectedEmail({ recipientName, companyName, rejectionReason }: KycRejectedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://transport-nine-mauve.vercel.app'
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={`${baseUrl}/logo-site.png`} width="160" height="60" alt="Trade Container" style={logo} />
          </Section>
          <Section style={content}>
            <Text style={heading}>Action Required: KYC Verification</Text>
            <Text style={paragraph}>Hello <strong>{recipientName}</strong>,</Text>
            <Text style={paragraph}>
              We were unable to verify your company <strong>{companyName}</strong> at this time.
            </Text>
            <Section style={reasonBox}>
              <Text style={reasonTitle}>Reason:</Text>
              <Text style={reasonText}>{rejectionReason}</Text>
            </Section>
            <Section style={stepsBox}>
              <Text style={stepsTitle}>Next Steps:</Text>
              <ol style={stepsList}>
                <li style={stepItem}>Review the reason above carefully</li>
                <li style={stepItem}>Update your documents in your dashboard</li>
                <li style={stepItem}>Resubmit for verification</li>
              </ol>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/settings`}>Update Documents</Button>
            </Section>
            <Text style={supportText}>
              Need help? Contact us at <a href="mailto:support@tradecontainer.eu" style={link}>support@tradecontainer.eu</a>
            </Text>
          </Section>
          <Section style={footerSection}>
            <Text style={footerText}>© 2026 Trade Container. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f3f4f6', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif' }
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' }
const header = { padding: '32px', textAlign: 'center' as const, backgroundColor: '#ffffff', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #e5e7eb' }
const logo = { margin: '0 auto' }
const content = { backgroundColor: '#ffffff', padding: '32px' }
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#374151', margin: '0 0 16px' }
const reasonBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const reasonTitle = { fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: '0 0 8px' }
const reasonText = { fontSize: '14px', color: '#7f1d1d', lineHeight: '20px', margin: 0 }
const stepsBox = { backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const stepsTitle = { fontSize: '16px', fontWeight: '600', color: '#92400e', margin: '0 0 12px' }
const stepsList = { margin: '0', paddingLeft: '20px', color: '#78350f' }
const stepItem = { marginBottom: '8px', fontSize: '14px', lineHeight: '20px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#dc2626', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const supportText = { fontSize: '14px', color: '#6b7280', textAlign: 'center' as const, margin: '24px 0 0' }
const link = { color: '#059669', textDecoration: 'underline' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
