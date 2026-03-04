import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from '@react-email/components'

interface ShipmentConfirmedEmailProps {
  recipientName: string
  recipientRole: 'client' | 'transporter'
  partnerName: string
  route: string
  containerType: string
  pickupDate: string
  agreedPrice: number
  currency: string
  shipmentId: string
  partnerPhone: string
  partnerEmail: string
}

export default function ShipmentConfirmedEmail(props: ShipmentConfirmedEmailProps) {
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
            <Text style={heading}>Shipment Confirmed! ✓</Text>
            <Text style={paragraph}>Hello <strong>{props.recipientName}</strong>,</Text>
            <Text style={paragraph}>Your shipment with <strong>{props.partnerName}</strong> has been confirmed.</Text>
            <Section style={detailsBox}>
              <table style={detailsTable}>
                <tr><td style={detailsLabel}>Route:</td><td style={detailsValue}>{props.route}</td></tr>
                <tr><td style={detailsLabel}>Container:</td><td style={detailsValue}>{props.containerType}</td></tr>
                <tr><td style={detailsLabel}>Pickup:</td><td style={detailsValue}>{props.pickupDate}</td></tr>
                <tr><td style={detailsLabel}>Price:</td><td style={detailsValue}>{props.currency} {props.agreedPrice}</td></tr>
              </table>
            </Section>
            <Section style={nextStepsBox}>
              <Text style={nextStepsTitle}>Next Steps:</Text>
              {props.recipientRole === 'client' ? (
                <ul style={stepsList}>
                  <li style={stepItem}>Your transporter will contact you to confirm pickup details</li>
                  <li style={stepItem}>Payment is held securely in escrow until delivery</li>
                  <li style={stepItem}>Track your shipment in real-time</li>
                </ul>
              ) : (
                <ul style={stepsList}>
                  <li style={stepItem}>Contact the client to confirm pickup details</li>
                  <li style={stepItem}>Update shipment status when you pick up the container</li>
                  <li style={stepItem}>Keep the client informed throughout the journey</li>
                </ul>
              )}
            </Section>
            <Section style={contactBox}>
              <Text style={contactTitle}>{props.recipientRole === 'client' ? 'Transporter' : 'Client'} Contact:</Text>
              <Text style={contactInfo}>📞 {props.partnerPhone}</Text>
              <Text style={contactInfo}>✉️ {props.partnerEmail}</Text>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/${props.recipientRole}/shipments/${props.shipmentId}`}>
                View Shipment
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
const nextStepsBox = { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const nextStepsTitle = { fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px' }
const stepsList = { margin: '0', paddingLeft: '20px', color: '#374151' }
const stepItem = { marginBottom: '8px', fontSize: '14px', lineHeight: '20px' }
const contactBox = { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const contactTitle = { fontSize: '14px', fontWeight: '600', color: '#166534', margin: '0 0 12px' }
const contactInfo = { fontSize: '14px', color: '#166534', margin: '4px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#059669', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
