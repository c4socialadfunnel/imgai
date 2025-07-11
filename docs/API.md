# IMGAI Platform API Documentation

## Overview

The IMGAI platform provides a comprehensive REST API for AI-powered image editing, user management, and subscription handling. The API is built using Supabase Edge Functions and Next.js API routes.

**Base URL**: `https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1`

## Authentication

All API endpoints require authentication using Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1000 requests per hour
- **Enterprise**: Unlimited

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error

---

## AI Processing Endpoints

### Process Image

Process an image using various AI operations.

**Endpoint**: `POST /ai-process`

**Request Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "operationType": "enhance",
  "options": {
    "quality": "high",
    "upscale": true,
    "style": "artistic"
  }
}
```

**Parameters**:
- `imageUrl` (string, required): URL of the image to process
- `operationType` (string, required): Type of operation
  - `enhance`: Improve image quality and resolution
  - `remove_object`: Remove unwanted objects
  - `style_transfer`: Apply artistic styles
  - `avatar_generation`: Generate AI avatars
- `options` (object, optional): Operation-specific options

**Response**:
```json
{
  "success": true,
  "processedUrl": "https://example.com/processed-image.jpg",
  "creditsUsed": 2,
  "imageId": "uuid",
  "processingTime": 2.3
}
```

**Credit Costs**:
- Enhancement: 2 credits
- Object Removal: 3 credits
- Style Transfer: 4 credits
- Avatar Generation: 6 credits

---

### Text to Image

Generate images from text descriptions.

**Endpoint**: `POST /text-to-image`

**Request Body**:
```json
{
  "prompt": "A futuristic city at sunset with flying cars",
  "options": {
    "width": 512,
    "height": 512,
    "style": "photorealistic",
    "quality": "high"
  }
}
```

**Parameters**:
- `prompt` (string, required): Text description of the image
- `options` (object, optional):
  - `width` (number): Image width (default: 512)
  - `height` (number): Image height (default: 512)
  - `style` (string): Art style ("photorealistic", "artistic", "cartoon")
  - `quality` (string): Quality level ("standard", "high")

**Response**:
```json
{
  "success": true,
  "imageUrl": "https://example.com/generated-image.jpg",
  "creditsUsed": 5,
  "imageId": "uuid",
  "prompt": "A futuristic city at sunset with flying cars"
}
```

**Credit Cost**: 5 credits

---

## User Management Endpoints

### Get User Stats

Retrieve user statistics and activity data.

**Endpoint**: `GET /get-user-stats`

**Response**:
```json
{
  "totalImages": 25,
  "imagesThisMonth": 8,
  "creditsUsedThisMonth": 16,
  "currentCredits": 84,
  "mostUsedOperation": "enhance",
  "recentActivity": [
    {
      "id": "uuid",
      "operation_type": "enhance",
      "credits_used": 2,
      "created_at": "2024-01-15T10:30:00Z",
      "processing_status": "completed"
    }
  ],
  "averageProcessingTime": 2.3
}
```

---

## Admin Endpoints

### Manage User

Admin-only endpoint for user management operations.

**Endpoint**: `POST /admin-manage-user`

**Request Body**:
```json
{
  "action": "adjust_credits",
  "targetUserId": "user-uuid",
  "data": {
    "credits": 50,
    "reason": "Promotional bonus"
  }
}
```

**Actions**:

#### Ban User
```json
{
  "action": "ban",
  "targetUserId": "user-uuid",
  "data": {
    "reason": "Terms of service violation"
  }
}
```

#### Unban User
```json
{
  "action": "unban",
  "targetUserId": "user-uuid"
}
```

#### Adjust Credits
```json
{
  "action": "adjust_credits",
  "targetUserId": "user-uuid",
  "data": {
    "credits": 100,
    "reason": "Refund for processing error"
  }
}
```

#### Update Role
```json
{
  "action": "update_role",
  "targetUserId": "user-uuid",
  "data": {
    "role": "admin"
  }
}
```

**Response**:
```json
{
  "success": true,
  "action": "adjust_credits",
  "targetUserId": "user-uuid",
  "message": "User adjust_credits completed successfully"
}
```

---

## Webhook Endpoints

### Stripe Webhook

Handles Stripe payment events for subscription management.

**Endpoint**: `POST /stripe-webhook`

**Headers**:
```
Stripe-Signature: <stripe_signature>
Content-Type: application/json
```

**Supported Events**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

**Response**:
```json
{
  "received": true
}
```

---

## Database Schema

### Users Table
```sql
users {
  id: uuid (primary key)
  email: text (unique)
  role: enum ('admin', 'user')
  credits: integer
  banned_at: timestamptz
  stripe_customer_id: text
  avatar_url: text
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Images Table
```sql
images {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  original_url: text
  processed_url: text
  operation_type: enum
  credits_used: integer
  processing_status: text
  metadata: jsonb
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Credit Transactions Table
```sql
credit_transactions {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  amount: integer
  transaction_type: enum
  description: text
  metadata: jsonb
  created_at: timestamptz
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://udkufaczmqzzuhyovsjj.supabase.co',
  'your-anon-key'
)

// Enhance an image
async function enhanceImage(imageUrl: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/ai-process',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        operationType: 'enhance',
        options: { quality: 'high' }
      })
    }
  )
  
  return response.json()
}

// Generate image from text
async function generateImage(prompt: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/text-to-image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        options: { width: 512, height: 512 }
      })
    }
  )
  
  return response.json()
}
```

### Python

```python
import requests
import json

class IMGAIClient:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def enhance_image(self, image_url, options=None):
        payload = {
            'imageUrl': image_url,
            'operationType': 'enhance',
            'options': options or {}
        }
        
        response = requests.post(
            f'{self.base_url}/ai-process',
            headers=self.headers,
            data=json.dumps(payload)
        )
        
        return response.json()
    
    def generate_image(self, prompt, options=None):
        payload = {
            'prompt': prompt,
            'options': options or {}
        }
        
        response = requests.post(
            f'{self.base_url}/text-to-image',
            headers=self.headers,
            data=json.dumps(payload)
        )
        
        return response.json()

# Usage
client = IMGAIClient(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1',
    'your-access-token'
)

result = client.enhance_image('https://example.com/image.jpg')
```

### cURL

```bash
# Enhance an image
curl -X POST \
  https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/ai-process \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "operationType": "enhance",
    "options": {
      "quality": "high",
      "upscale": true
    }
  }'

# Generate image from text
curl -X POST \
  https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/text-to-image \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "options": {
      "width": 512,
      "height": 512,
      "style": "photorealistic"
    }
  }'
```

---

## Subscription Plans

### Plan Details

| Plan | Monthly Credits | Price | Features |
|------|----------------|-------|----------|
| Free | 10 | $0 | Basic tools, standard processing |
| Starter | 100 | $9 | All tools, priority processing |
| Pro | 500 | $19 | All tools, priority processing, email support |
| Enterprise | 2500 | $99 | All tools, fastest processing, API access, priority support |

### Credit Costs by Operation

| Operation | Credits | Description |
|-----------|---------|-------------|
| Image Enhancement | 2 | Improve quality and resolution |
| Object Removal | 3 | Remove unwanted elements |
| Style Transfer | 4 | Apply artistic styles |
| Text-to-Image | 5 | Generate images from text |
| Avatar Generation | 6 | Create custom AI avatars |

---

## Support

- **Documentation**: [https://docs.imgai.com](https://docs.imgai.com)
- **Support Email**: support@imgai.com
- **Status Page**: [https://status.imgai.com](https://status.imgai.com)
- **Discord Community**: [https://discord.gg/imgai](https://discord.gg/imgai)

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- AI image processing endpoints
- User management and authentication
- Subscription and credit system
- Admin panel functionality

---

*Last updated: January 2024*