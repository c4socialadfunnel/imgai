import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRequest {
  imageUrl: string
  operationType: 'enhance' | 'remove_object' | 'style_transfer' | 'text_to_image' | 'avatar_generation'
  options?: Record<string, any>
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

    const { imageUrl, operationType, options = {} }: ProcessRequest = await req.json()

    // Get AI model configuration
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('model_type', operationType)
      .eq('enabled', true)
      .single()

    if (modelError || !model) {
      return new Response(
        JSON.stringify({ error: 'AI model not available' }),
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

    // TODO: Integrate with Google Vertex AI
    // For now, simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock processed image URL
    const processedUrl = `${imageUrl}?processed=${Date.now()}`

    // Create image record
    const { data: imageRecord, error: imageError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        original_url: imageUrl,
        processed_url: processedUrl,
        operation_type: operationType,
        credits_used: model.credit_cost,
        processing_status: 'completed',
        metadata: options
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
        description: `${model.name} processing`
      })

    return new Response(
      JSON.stringify({
        success: true,
        processedUrl,
        creditsUsed: model.credit_cost,
        imageId: imageRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})