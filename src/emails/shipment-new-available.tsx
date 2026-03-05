import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface ShipmentNewAvailableEmailProps {
  recipientName: string
  originCity: string
  originCountry: string
  originAddress?: string
  destinationCity: string
  destinationCountry: string
  destinationAddress?: string
  containerType: string
  containerCount: number
  cargoWeight: number
  pickupDate: string
  deliveryDate?: string
  budget: number
  currency: string
  shipmentId: string
}

export default function ShipmentNewAvailableEmail(props: ShipmentNewAvailableEmailProps) {
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
            <Text style={heading}>New Shipment Available! 🚚</Text>
            <Text style={paragraph}>Hello <strong>{props.recipientName}</strong>,</Text>
            <Text style={paragraph}>A new shipment matching your operating countries is available.</Text>
            
            <Section style={detailsBox}>
              <Text style={sectionTitle}>📍 Pickup Location</Text>
              <table style={detailsTable}>
                <tr><td style={detailsLabel}>City:</td><td style={detailsValue}>{props.originCity}, {props.originCountry}</td></tr>
                {props.originAddress && <tr><td style={detailsLabel}>Address:</td><td style={detailsValue}>{props.originAddress}</td></tr>}
                <tr><td style={detailsLabel}>Date:</td><td style={detailsValue}>{props.pickupDate}</td></tr>
              </table>
            </Section>

            <Section style={detailsBox}>
              <Text style={sectionTitle}>🎯 Destination</Text>
              <table style={detailsTable}>
                <tr><td style={detailsLabel}>City:</td><td style={detailsValue}>{props.destinationCity}, {props.destinationCountry}</td></tr>
                {props.destinationAddress && <tr><td style={detailsLabel}>Address:</td><td style={detailsValue}>{props.destinationAddress}</td></tr>}
                {props.deliveryDate && <tr><td style={detailsLabel}>Delivery:</td><td style={detailsValue}>{props.deliveryDate}</td></tr>}
              </table>
            </Section>

            <Section style={detailsBox}>
              <Text style={sectionTitle}>📦 Cargo Details</Text>
              <table style={detailsTable}>
                <tr><td style={detailsLabel}>Container:</td><td style={detailsValue}>{props.containerType} x {props.containerCount}</td></tr>
                <tr><td style={detailsLabel}>Weight:</td><td style={detailsValue}>{props.cargoWeight} tons</td></tr>
                <tr><td style={detailsLabel}>Budget:</td><td style={detailsValue}>{props.currency} {props.budget}</td></tr>
              </table>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/transporter/shipments/${props.shipmentId}`}>
                View Details & Send Offer
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
const sectionTitle = { fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px' }
const detailsBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', margin: '16px 0' }
const detailsTable = { width: '100%', fontSize: '14px' }
const detailsLabel = { color: '#6b7280', paddingBottom: '8px', paddingRight: '16px' }
const detailsValue = { color: '#111827', fontWeight: '500', paddingBottom: '8px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
