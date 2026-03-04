import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components'

interface OfferNewEmailProps {
  recipientName: string
  transporterName: string
  transporterCountry: string
  price: number
  currency: string
  route: string
  containerType: string
  pickupDate: string
  shipmentId: string
  validUntil: string
}

export default function OfferNewEmail({
  recipientName,
  transporterName,
  transporterCountry,
  price,
  currency,
  route,
  containerType,
  pickupDate,
  shipmentId,
  validUntil,
}: OfferNewEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://transport-nine-mauve.vercel.app'
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-site.png`}
              width="160"
              height="60"
              alt="Trade Container"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Text style={heading}>New Offer Received! 🎉</Text>
            
            <Text style={paragraph}>
              Hello <strong>{recipientName}</strong>,
            </Text>

            <Text style={paragraph}>
              You have received a new offer from <strong>{transporterName}</strong> ({transporterCountry}) for your shipment.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Shipment Details</Text>
              <Hr style={divider} />
              <table style={detailsTable}>
                <tr>
                  <td style={detailsLabel}>Route:</td>
                  <td style={detailsValue}>{route}</td>
                </tr>
                <tr>
                  <td style={detailsLabel}>Container:</td>
                  <td style={detailsValue}>{containerType}</td>
                </tr>
                <tr>
                  <td style={detailsLabel}>Pickup Date:</td>
                  <td style={detailsValue}>{pickupDate}</td>
                </tr>
                <tr>
                  <td style={detailsLabel}>Valid Until:</td>
                  <td style={detailsValue}>{validUntil}</td>
                </tr>
              </table>
              <Hr style={divider} />
              <Text style={priceText}>
                Offered Price: <span style={priceAmount}>{currency} {price}</span>
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${baseUrl}/dashboard/client/shipments/${shipmentId}`}
              >
                View & Accept Offer
              </Button>
            </Section>

            <Text style={footer}>
              This offer is valid until {validUntil}. Review and respond promptly to secure the best transporters.
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              © 2026 Trade Container. All rights reserved.
            </Text>
            <Text style={footerText}>
              <a href={`${baseUrl}/unsubscribe`} style={link}>Unsubscribe</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const header = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  borderRadius: '8px 8px 0 0',
  borderBottom: '1px solid #e5e7eb',
}

const logo = {
  margin: '0 auto',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
}

const detailsTable = {
  width: '100%',
  fontSize: '14px',
}

const detailsLabel = {
  color: '#6b7280',
  paddingBottom: '8px',
  paddingRight: '16px',
}

const detailsValue = {
  color: '#111827',
  fontWeight: '500',
  paddingBottom: '8px',
}

const priceText = {
  fontSize: '16px',
  color: '#374151',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}

const priceAmount = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#059669',
  display: 'block',
  marginTop: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const footerSection = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
  borderRadius: '0 0 8px 8px',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0',
}

const link = {
  color: '#6b7280',
  textDecoration: 'underline',
}
