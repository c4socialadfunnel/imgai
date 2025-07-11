import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TextToImageRequest {
  prompt: string
  options?: {
    width?: number
    height?: number
    style?: string
    quality?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, options = {} }: TextToImageRequest = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get text-to-image model
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('model_type', 'text_to_image')
      .eq('enabled', true)
      .single()

    if (modelError || !model) {
      return new Response(
        JSON.stringify({ error: 'Text-to-image model not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (userData.credits < model.credit_cost) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Integrate with Google Vertex AI for actual image generation
    // For now, use a placeholder service
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const generatedImageUrl = `https://picsum.photos/${options.width || 512}/${options.height || 512}?random=${Date.now()}`

    // Create image record
    const { data: imageRecord, error: imageError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        original_url: '',
        processed_url: generatedImageUrl,
        operation_type: 'text_to_image',
        credits_used: model.credit_cost,
        processing_status: 'completed',
        metadata: { prompt, ...options }
      })
      .select()
      .single()

    if (imageError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save image record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ 
        credits: userData.credits - model.credit_cost,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (creditError) {
      return new Response(
        JSON.stringify({ error: 'Failed to deduct credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -model.credit_cost,
        transaction_type: 'usage',
        description: 'Text-to-image generation'
      })

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: generatedImageUrl,
        creditsUsed: model.credit_cost,
        imageId: imageRecord.id,
        prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Text-to-image generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})