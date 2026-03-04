import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface SubscriptionExpiringEmailProps {
  recipientName: string
  daysRemaining: number
  expiryDate: string
  plan: string
  price: number
  currency: string
}

export default function SubscriptionExpiringEmail(props: SubscriptionExpiringEmailProps) {
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
            <Text style={heading}>Subscription Expiring Soon ⏰</Text>
            <Text style={paragraph}>Hello <strong>{props.recipientName}</strong>,</Text>
            <Text style={paragraph}>
              Your <strong>{props.plan}</strong> subscription will expire in <strong>{props.daysRemaining} days</strong> ({props.expiryDate}).
            </Text>
            <Section style={warningBox}>
              <Text style={warningTitle}>What happens after expiry:</Text>
              <ul style={warningList}>
                <li style={warningItem}>Limited access to platform features</li>
                <li style={warningItem}>Cannot post new shipments or send offers</li>
                <li style={warningItem}>Existing shipments remain active</li>
              </ul>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/settings/subscription`}>
                Renew Now - {props.currency} {props.price}
              </Button>
            </Section>
            <Text style={footer}>Don't lose access to your business opportunities. Renew today!</Text>
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
const warningBox = { backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const warningTitle = { fontSize: '16px', fontWeight: '600', color: '#92400e', margin: '0 0 12px' }
const warningList = { margin: '0', paddingLeft: '20px', color: '#78350f' }
const warningItem = { marginBottom: '8px', fontSize: '14px', lineHeight: '20px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#059669', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footer = { fontSize: '14px', color: '#6b7280', textAlign: 'center' as const, margin: '24px 0 0' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
