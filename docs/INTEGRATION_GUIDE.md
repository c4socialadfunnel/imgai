# IMGAI Platform Integration Guide

## Quick Start

This guide will help you integrate the IMGAI platform into your application in under 10 minutes.

## Prerequisites

- Node.js 18+ or Python 3.8+
- Valid IMGAI account with API access
- Basic understanding of REST APIs

## Step 1: Authentication Setup

### Get Your API Credentials

1. Sign up at [IMGAI Platform](https://imgai.com)
2. Navigate to your dashboard
3. Go to Settings > API Keys
4. Generate a new API key

### Initialize the Client

#### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://udkufaczmqzzuhyovsjj.supabase.co',
  'your-anon-key'
)

// Sign in to get access token
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
})

const accessToken = data.session?.access_token
```

#### Python
```python
import requests
import json

class IMGAIClient:
    def __init__(self, email, password):
        self.base_url = 'https://udkufaczmqzzuhyovsjj.supabase.co'
        self.access_token = self._authenticate(email, password)
        self.headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def _authenticate(self, email, password):
        # Implement Supabase auth here
        # Return access token
        pass
```

## Step 2: Basic Image Enhancement

### Upload and Enhance an Image

#### JavaScript/TypeScript
```typescript
async function enhanceImage(file: File) {
  // 1. Upload image to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  // 3. Process with AI
  const response = await fetch(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/ai-process',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: publicUrl,
        operationType: 'enhance',
        options: {
          quality: 'high',
          upscale: true
        }
      })
    }
  )

  const result = await response.json()
  return result.processedUrl
}

// Usage
const fileInput = document.getElementById('file-input')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const enhancedUrl = await enhanceImage(file)
  console.log('Enhanced image:', enhancedUrl)
})
```

#### Python
```python
def enhance_image(self, image_path):
    # 1. Upload image (implement upload logic)
    image_url = self._upload_image(image_path)
    
    # 2. Process with AI
    payload = {
        'imageUrl': image_url,
        'operationType': 'enhance',
        'options': {
            'quality': 'high',
            'upscale': True
        }
    }
    
    response = requests.post(
        f'{self.base_url}/functions/v1/ai-process',
        headers=self.headers,
        data=json.dumps(payload)
    )
    
    result = response.json()
    return result['processedUrl']

# Usage
client = IMGAIClient('email@example.com', 'password')
enhanced_url = client.enhance_image('path/to/image.jpg')
print(f'Enhanced image: {enhanced_url}')
```

## Step 3: Text-to-Image Generation

### Generate Images from Text

#### JavaScript/TypeScript
```typescript
async function generateImage(prompt: string) {
  const response = await fetch(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/text-to-image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        options: {
          width: 512,
          height: 512,
          style: 'photorealistic'
        }
      })
    }
  )

  const result = await response.json()
  return result.imageUrl
}

// Usage
const imageUrl = await generateImage('A beautiful sunset over mountains')
console.log('Generated image:', imageUrl)
```

#### Python
```python
def generate_image(self, prompt, options=None):
    payload = {
        'prompt': prompt,
        'options': options or {
            'width': 512,
            'height': 512,
            'style': 'photorealistic'
        }
    }
    
    response = requests.post(
        f'{self.base_url}/functions/v1/text-to-image',
        headers=self.headers,
        data=json.dumps(payload)
    )
    
    result = response.json()
    return result['imageUrl']

# Usage
image_url = client.generate_image('A beautiful sunset over mountains')
print(f'Generated image: {image_url}')
```

## Step 4: Error Handling

### Robust Error Handling

#### JavaScript/TypeScript
```typescript
async function safeImageProcessing(file: File, operation: string) {
  try {
    const result = await processImage(file, operation)
    return { success: true, data: result }
  } catch (error) {
    if (error.message.includes('Insufficient credits')) {
      return { 
        success: false, 
        error: 'INSUFFICIENT_CREDITS',
        message: 'Please purchase more credits to continue'
      }
    }
    
    if (error.message.includes('Unauthorized')) {
      return { 
        success: false, 
        error: 'UNAUTHORIZED',
        message: 'Please sign in to continue'
      }
    }
    
    return { 
      success: false, 
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred'
    }
  }
}
```

#### Python
```python
def safe_image_processing(self, image_path, operation):
    try:
        result = self.process_image(image_path, operation)
        return {'success': True, 'data': result}
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            error_data = e.response.json()
            if 'Insufficient credits' in error_data.get('error', ''):
                return {
                    'success': False,
                    'error': 'INSUFFICIENT_CREDITS',
                    'message': 'Please purchase more credits to continue'
                }
        elif e.response.status_code == 401:
            return {
                'success': False,
                'error': 'UNAUTHORIZED',
                'message': 'Please sign in to continue'
            }
        
        return {
            'success': False,
            'error': 'HTTP_ERROR',
            'message': f'HTTP {e.response.status_code}: {e.response.text}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': 'UNKNOWN_ERROR',
            'message': str(e)
        }
```

## Step 5: Progress Tracking

### Real-time Progress Updates

#### JavaScript/TypeScript
```typescript
class IMGAIProcessor {
  private progressCallback?: (progress: number) => void

  setProgressCallback(callback: (progress: number) => void) {
    this.progressCallback = callback
  }

  async processWithProgress(file: File, operation: string) {
    this.progressCallback?.(0)
    
    // Upload phase
    this.progressCallback?.(20)
    const imageUrl = await this.uploadImage(file)
    
    // Processing phase
    this.progressCallback?.(40)
    const result = await this.processImage(imageUrl, operation)
    
    // Complete
    this.progressCallback?.(100)
    return result
  }
}

// Usage
const processor = new IMGAIProcessor()
processor.setProgressCallback((progress) => {
  console.log(`Progress: ${progress}%`)
  document.getElementById('progress-bar').style.width = `${progress}%`
})

await processor.processWithProgress(file, 'enhance')
```

## Step 6: Batch Processing

### Process Multiple Images

#### JavaScript/TypeScript
```typescript
async function batchProcessImages(files: File[], operation: string) {
  const results = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`Processing ${i + 1}/${files.length}: ${file.name}`)
    
    try {
      const result = await processImage(file, operation)
      results.push({ file: file.name, success: true, url: result.processedUrl })
    } catch (error) {
      results.push({ file: file.name, success: false, error: error.message })
    }
    
    // Add delay to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// Usage
const files = Array.from(document.getElementById('file-input').files)
const results = await batchProcessImages(files, 'enhance')
console.log('Batch processing results:', results)
```

## Step 7: Credit Management

### Check and Monitor Credits

#### JavaScript/TypeScript
```typescript
async function getUserStats() {
  const response = await fetch(
    'https://udkufaczmqzzuhyovsjj.supabase.co/functions/v1/get-user-stats',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    }
  )
  
  return response.json()
}

async function checkCreditsBeforeProcessing(operation: string) {
  const stats = await getUserStats()
  const creditCosts = {
    enhance: 2,
    remove_object: 3,
    style_transfer: 4,
    text_to_image: 5,
    avatar_generation: 6
  }
  
  const requiredCredits = creditCosts[operation]
  
  if (stats.currentCredits < requiredCredits) {
    throw new Error(`Insufficient credits. Required: ${requiredCredits}, Available: ${stats.currentCredits}`)
  }
  
  return true
}

// Usage
try {
  await checkCreditsBeforeProcessing('enhance')
  const result = await processImage(file, 'enhance')
} catch (error) {
  console.error('Credit check failed:', error.message)
}
```

## Common Integration Patterns

### React Hook

```typescript
import { useState, useCallback } from 'react'

export function useIMGAI() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processImage = useCallback(async (file: File, operation: string) => {
    setProcessing(true)
    setProgress(0)

    try {
      // Implementation here
      const result = await enhanceImage(file)
      return result
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }, [])

  return { processImage, processing, progress }
}

// Usage in component
function ImageEditor() {
  const { processImage, processing, progress } = useIMGAI()

  const handleProcess = async (file: File) => {
    const result = await processImage(file, 'enhance')
    console.log('Result:', result)
  }

  return (
    <div>
      {processing && <div>Progress: {progress}%</div>}
      <input type="file" onChange={(e) => handleProcess(e.target.files[0])} />
    </div>
  )
}
```

### Vue.js Composable

```typescript
import { ref, computed } from 'vue'

export function useIMGAI() {
  const processing = ref(false)
  const progress = ref(0)

  const processImage = async (file: File, operation: string) => {
    processing.value = true
    progress.value = 0

    try {
      // Implementation here
      const result = await enhanceImage(file)
      return result
    } finally {
      processing.value = false
      progress.value = 0
    }
  }

  return {
    processImage,
    processing: computed(() => processing.value),
    progress: computed(() => progress.value)
  }
}
```

## Best Practices

### 1. Image Optimization
- Compress images before upload to reduce processing time
- Use appropriate image formats (JPEG for photos, PNG for graphics)
- Limit image size to 10MB for optimal performance

### 2. Error Handling
- Always implement retry logic for network failures
- Provide user-friendly error messages
- Log errors for debugging purposes

### 3. Performance
- Implement image caching to avoid reprocessing
- Use lazy loading for image galleries
- Consider using WebP format for better compression

### 4. Security
- Never expose API keys in client-side code
- Validate file types and sizes before upload
- Implement rate limiting on your end

### 5. User Experience
- Show progress indicators for long operations
- Provide preview functionality
- Allow users to cancel ongoing operations

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure your access token is valid and not expired
   - Check that you're using the correct Supabase URL and keys

2. **Insufficient Credits**
   - Check user credit balance before processing
   - Implement credit purchase flow

3. **File Upload Failures**
   - Verify file size limits (10MB max)
   - Check supported file formats
   - Ensure proper CORS configuration

4. **Processing Timeouts**
   - Large images may take longer to process
   - Implement proper timeout handling
   - Consider image compression for faster processing

### Getting Help

- Check the [API Documentation](./API.md)
- Visit our [Support Center](https://support.imgai.com)
- Join our [Discord Community](https://discord.gg/imgai)
- Email us at [support@imgai.com](mailto:support@imgai.com)