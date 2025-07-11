# IMGAI Webhook Integration Guide

## Overview

IMGAI provides webhooks to notify your application about important events such as image processing completion, credit transactions, and subscription changes.

## Webhook Events

### Image Processing Events

#### `image.processing.started`
Triggered when image processing begins.

```json
{
  "event": "image.processing.started",
  "data": {
    "imageId": "uuid",
    "userId": "uuid",
    "operationType": "enhance",
    "originalUrl": "https://example.com/original.jpg",
    "creditsUsed": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `image.processing.completed`
Triggered when image processing is successfully completed.

```json
{
  "event": "image.processing.completed",
  "data": {
    "imageId": "uuid",
    "userId": "uuid",
    "operationType": "enhance",
    "originalUrl": "https://example.com/original.jpg",
    "processedUrl": "https://example.com/processed.jpg",
    "creditsUsed": 2,
    "processingTime": 2.3,
    "timestamp": "2024-01-15T10:32:18Z"
  }
}
```

#### `image.processing.failed`
Triggered when image processing fails.

```json
{
  "event": "image.processing.failed",
  "data": {
    "imageId": "uuid",
    "userId": "uuid",
    "operationType": "enhance",
    "originalUrl": "https://example.com/original.jpg",
    "error": "Processing timeout",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### Credit Events

#### `credits.purchased`
Triggered when a user purchases credits.

```json
{
  "event": "credits.purchased",
  "data": {
    "userId": "uuid",
    "amount": 100,
    "transactionId": "uuid",
    "paymentMethod": "stripe",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `credits.depleted`
Triggered when a user's credits fall below a threshold.

```json
{
  "event": "credits.depleted",
  "data": {
    "userId": "uuid",
    "remainingCredits": 2,
    "threshold": 5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Subscription Events

#### `subscription.created`
Triggered when a new subscription is created.

```json
{
  "event": "subscription.created",
  "data": {
    "userId": "uuid",
    "subscriptionId": "uuid",
    "planId": "pro",
    "status": "active",
    "currentPeriodStart": "2024-01-15T00:00:00Z",
    "currentPeriodEnd": "2024-02-15T00:00:00Z",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `subscription.updated`
Triggered when a subscription is modified.

```json
{
  "event": "subscription.updated",
  "data": {
    "userId": "uuid",
    "subscriptionId": "uuid",
    "planId": "enterprise",
    "previousPlanId": "pro",
    "status": "active",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `subscription.cancelled`
Triggered when a subscription is cancelled.

```json
{
  "event": "subscription.cancelled",
  "data": {
    "userId": "uuid",
    "subscriptionId": "uuid",
    "planId": "pro",
    "cancelledAt": "2024-01-15T10:30:00Z",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Setting Up Webhooks

### 1. Create Webhook Endpoint

Create an endpoint in your application to receive webhook events:

#### Express.js Example
```javascript
const express = require('express')
const crypto = require('crypto')
const app = express()

app.use(express.raw({ type: 'application/json' }))

app.post('/webhooks/imgai', (req, res) => {
  const signature = req.headers['imgai-signature']
  const payload = req.body
  
  // Verify webhook signature
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature')
  }
  
  const event = JSON.parse(payload)
  
  // Handle different event types
  switch (event.event) {
    case 'image.processing.completed':
      handleImageCompleted(event.data)
      break
    case 'credits.depleted':
      handleCreditsLow(event.data)
      break
    case 'subscription.cancelled':
      handleSubscriptionCancelled(event.data)
      break
    default:
      console.log(`Unhandled event: ${event.event}`)
  }
  
  res.status(200).send('OK')
})

function verifySignature(payload, signature) {
  const secret = process.env.IMGAI_WEBHOOK_SECRET
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}
```

#### Next.js API Route Example
```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('imgai-signature')
  const payload = await request.text()
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(payload)
  
  // Handle event
  await handleWebhookEvent(event)
  
  return NextResponse.json({ received: true })
}

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  
  const secret = process.env.IMGAI_WEBHOOK_SECRET!
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}
```

### 2. Register Webhook URL

Register your webhook endpoint in the IMGAI dashboard:

1. Go to Settings > Webhooks
2. Click "Add Webhook"
3. Enter your endpoint URL
4. Select the events you want to receive
5. Save the webhook

### 3. Handle Events

Implement handlers for different event types:

```typescript
async function handleWebhookEvent(event: any) {
  switch (event.event) {
    case 'image.processing.completed':
      await notifyUserImageReady(event.data)
      break
      
    case 'image.processing.failed':
      await notifyUserImageFailed(event.data)
      break
      
    case 'credits.depleted':
      await sendLowCreditsEmail(event.data)
      break
      
    case 'subscription.cancelled':
      await handleSubscriptionCancellation(event.data)
      break
      
    default:
      console.log(`Unhandled event: ${event.event}`)
  }
}

async function notifyUserImageReady(data: any) {
  // Send email notification
  await sendEmail({
    to: await getUserEmail(data.userId),
    subject: 'Your image is ready!',
    template: 'image-ready',
    data: {
      imageUrl: data.processedUrl,
      operationType: data.operationType
    }
  })
  
  // Send push notification
  await sendPushNotification(data.userId, {
    title: 'Image Processing Complete',
    body: 'Your enhanced image is ready for download',
    data: { imageId: data.imageId }
  })
}

async function sendLowCreditsEmail(data: any) {
  await sendEmail({
    to: await getUserEmail(data.userId),
    subject: 'Low Credits Warning',
    template: 'low-credits',
    data: {
      remainingCredits: data.remainingCredits,
      purchaseUrl: 'https://imgai.com/billing'
    }
  })
}
```

## Security

### Signature Verification

Always verify webhook signatures to ensure requests are from IMGAI:

```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}
```

### Best Practices

1. **Always verify signatures** before processing webhook events
2. **Use HTTPS** for webhook endpoints
3. **Implement idempotency** to handle duplicate events
4. **Return 200 status** quickly to acknowledge receipt
5. **Process events asynchronously** to avoid timeouts
6. **Log all webhook events** for debugging

## Testing Webhooks

### Local Development

Use tools like ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 3000

# Use the HTTPS URL for webhook registration
# Example: https://abc123.ngrok.io/webhooks/imgai
```

### Webhook Testing Tool

```typescript
// webhook-tester.ts
import express from 'express'

const app = express()
app.use(express.json())

app.post('/test-webhook', (req, res) => {
  console.log('Received webhook:')
  console.log('Headers:', req.headers)
  console.log('Body:', JSON.stringify(req.body, null, 2))
  
  res.status(200).send('OK')
})

app.listen(3001, () => {
  console.log('Webhook tester running on port 3001')
})
```

## Error Handling

### Retry Logic

IMGAI will retry failed webhook deliveries with exponential backoff:

- Initial retry: 1 second
- Second retry: 5 seconds
- Third retry: 25 seconds
- Fourth retry: 125 seconds
- Final retry: 625 seconds

### Handling Failures

```typescript
app.post('/webhooks/imgai', async (req, res) => {
  try {
    const event = JSON.parse(req.body)
    await processWebhookEvent(event)
    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Return 500 to trigger retry
    res.status(500).send('Internal Server Error')
  }
})

async function processWebhookEvent(event: any) {
  // Add to queue for async processing
  await addToQueue('webhook-events', event)
}
```

## Monitoring

### Webhook Logs

Monitor webhook delivery in the IMGAI dashboard:

1. Go to Settings > Webhooks
2. Click on your webhook
3. View delivery logs and response codes

### Health Check Endpoint

Implement a health check for your webhook endpoint:

```typescript
app.get('/webhooks/imgai/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})
```

## Examples

### Real-time Image Gallery Update

```typescript
// Update image gallery when processing completes
async function handleImageCompleted(data: any) {
  // Broadcast to connected clients via WebSocket
  io.to(`user:${data.userId}`).emit('image:completed', {
    imageId: data.imageId,
    processedUrl: data.processedUrl,
    operationType: data.operationType
  })
  
  // Update database
  await updateImageStatus(data.imageId, 'completed', data.processedUrl)
}
```

### Automated Credit Top-up

```typescript
// Automatically purchase credits when low
async function handleCreditsLow(data: any) {
  const user = await getUser(data.userId)
  
  if (user.autoTopup && user.paymentMethod) {
    try {
      await purchaseCredits(data.userId, 100) // Buy 100 credits
      
      await sendEmail({
        to: user.email,
        subject: 'Credits Auto-Topped Up',
        template: 'auto-topup',
        data: { amount: 100 }
      })
    } catch (error) {
      console.error('Auto top-up failed:', error)
      
      await sendEmail({
        to: user.email,
        subject: 'Auto Top-up Failed',
        template: 'topup-failed',
        data: { error: error.message }
      })
    }
  }
}
```

### Subscription Analytics

```typescript
// Track subscription events for analytics
async function handleSubscriptionEvent(event: any) {
  await analytics.track({
    userId: event.data.userId,
    event: event.event,
    properties: {
      planId: event.data.planId,
      subscriptionId: event.data.subscriptionId,
      timestamp: event.data.timestamp
    }
  })
  
  // Update user segments
  await updateUserSegment(event.data.userId, event.data.planId)
}
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible from internet
   - Verify webhook is registered correctly
   - Check firewall settings

2. **Signature verification failing**
   - Ensure you're using the correct webhook secret
   - Verify payload is not modified before verification
   - Check character encoding (should be UTF-8)

3. **Timeouts**
   - Process events asynchronously
   - Return 200 status quickly
   - Use queues for heavy processing

### Debug Mode

Enable debug logging for webhook events:

```typescript
const DEBUG_WEBHOOKS = process.env.NODE_ENV === 'development'

app.post('/webhooks/imgai', (req, res) => {
  if (DEBUG_WEBHOOKS) {
    console.log('Webhook received:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    })
  }
  
  // Process webhook...
})
```