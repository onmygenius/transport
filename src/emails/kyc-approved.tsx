import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface KycApprovedEmailProps {
  recipientName: string
  companyName: string
  role: 'client' | 'transporter'
}

export default function KycApprovedEmail({ recipientName, companyName, role }: KycApprovedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://transport-nine-mauve.vercel.app'
  const dashboardUrl = `${baseUrl}/dashboard/${role}`
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={`${baseUrl}/logo-site.png`} width="160" height="60" alt="Trade Container" style={logo} />
          </Section>
          <Section style={content}>
            <div style={iconContainer}>
              <div style={checkIcon}>✓</div>
            </div>
            <Text style={heading}>Account Verified!</Text>
            <Text style={paragraph}>Hello <strong>{recipientName}</strong>,</Text>
            <Text style={paragraph}>
              Great news! Your company <strong>{companyName}</strong> has been successfully verified.
            </Text>
            <Section style={benefitsBox}>
              <Text style={benefitsTitle}>You can now:</Text>
              {role === 'client' ? (
                <ul style={benefitsList}>
                  <li style={benefitItem}>✓ Post unlimited shipments across Europe</li>
                  <li style={benefitItem}>✓ Connect with verified transporters</li>
                  <li style={benefitItem}>✓ Receive competitive offers</li>
                  <li style={benefitItem}>✓ Track shipments in real-time</li>
                </ul>
              ) : (
                <ul style={benefitsList}>
                  <li style={benefitItem}>✓ Send offers to clients</li>
                  <li style={benefitItem}>✓ Access thousands of shipments</li>
                  <li style={benefitItem}>✓ Start earning with your fleet</li>
                  <li style={benefitItem}>✓ Build your reputation</li>
                </ul>
              )}
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>Go to Dashboard</Button>
            </Section>
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
const content = { backgroundColor: '#ffffff', padding: '32px', textAlign: 'center' as const }
const iconContainer = { margin: '0 0 24px' }
const checkIcon = { display: 'inline-block', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', fontSize: '40px', fontWeight: 'bold', lineHeight: '64px', textAlign: 'center' as const }
const heading = { fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#374151', margin: '0 0 16px', textAlign: 'center' as const }
const benefitsBox = { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '24px', margin: '24px 0', textAlign: 'left' as const }
const benefitsTitle = { fontSize: '16px', fontWeight: '600', color: '#166534', margin: '0 0 16px' }
const benefitsList = { margin: '0', paddingLeft: '0', listStyle: 'none' }
const benefitItem = { fontSize: '14px', color: '#166534', marginBottom: '12px', lineHeight: '20px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#059669', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
