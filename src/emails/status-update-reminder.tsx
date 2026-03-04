import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface StatusUpdateReminderEmailProps {
  recipientName: string
  route: string
  pickupDate: string
  shipmentId: string
  currentStatus: string
}

export default function StatusUpdateReminderEmail(props: StatusUpdateReminderEmailProps) {
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
            <Text style={heading}>Status Update Needed</Text>
            <Text style={paragraph}>Hello <strong>{props.recipientName}</strong>,</Text>
            <Text style={paragraph}>
              Please update the status for your shipment <strong>{props.route}</strong>.
            </Text>
            <Section style={detailsBox}>
              <table style={detailsTable}>
                <tr><td style={detailsLabel}>Route:</td><td style={detailsValue}>{props.route}</td></tr>
                <tr><td style={detailsLabel}>Picked up:</td><td style={detailsValue}>{props.pickupDate}</td></tr>
                <tr><td style={detailsLabel}>Current status:</td><td style={detailsValue}>{props.currentStatus}</td></tr>
              </table>
            </Section>
            <Section style={importanceBox}>
              <Text style={importanceTitle}>Why it matters:</Text>
              <Text style={importanceText}>
                Keeping clients informed throughout the journey builds trust and improves your rating on the platform.
              </Text>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/transporter/jobs/${props.shipmentId}`}>
                Update Status
              </Button>
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
const content = { backgroundColor: '#ffffff', padding: '32px' }
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#374151', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const detailsTable = { width: '100%', fontSize: '14px' }
const detailsLabel = { color: '#6b7280', paddingBottom: '8px', paddingRight: '16px' }
const detailsValue = { color: '#111827', fontWeight: '500', paddingBottom: '8px' }
const importanceBox = { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', margin: '24px 0' }
const importanceTitle = { fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 8px' }
const importanceText = { fontSize: '14px', color: '#1e3a8a', lineHeight: '20px', margin: 0 }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
