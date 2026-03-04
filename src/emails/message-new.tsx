import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface MessageNewEmailProps {
  recipientName: string
  senderName: string
  messagePreview: string
  shipmentRoute: string
  shipmentId: string
}

export default function MessageNewEmail(props: MessageNewEmailProps) {
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
            <Text style={heading}>New Message 💬</Text>
            <Text style={paragraph}>Hello <strong>{props.recipientName}</strong>,</Text>
            <Text style={paragraph}>
              You have a new message from <strong>{props.senderName}</strong> about shipment <strong>{props.shipmentRoute}</strong>.
            </Text>
            <Section style={messageBox}>
              <Text style={messagePreview}>"{props.messagePreview}..."</Text>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/messages/${props.shipmentId}`}>
                View & Reply
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
const messageBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderLeft: '4px solid #2563eb', borderRadius: '8px', padding: '20px', margin: '24px 0' }
const messagePreview = { fontSize: '14px', color: '#374151', fontStyle: 'italic', lineHeight: '20px', margin: 0 }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 32px' }
const footerSection = { backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#6b7280', margin: '4px 0' }
