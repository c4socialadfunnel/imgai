import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total images processed
    const { count: totalImages } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get images this month
    const { count: imagesThisMonth } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', firstDayOfMonth.toISOString())

    // Get credits used this month
    const { data: creditTransactions } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('transaction_type', 'usage')
      .gte('created_at', firstDayOfMonth.toISOString())

    const creditsUsedThisMonth = Math.abs(
      creditTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
    )

    // Get most used operation
    const { data: operationStats } = await supabase
      .from('images')
      .select('operation_type')
      .eq('user_id', user.id)

    const operationCounts = operationStats?.reduce((acc, img) => {
      acc[img.operation_type] = (acc[img.operation_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const mostUsedOperation = Object.entries(operationCounts).sort(
      ([,a], [,b]) => b - a
    )[0]?.[0] || ''

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get current user data
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    return new Response(
      JSON.stringify({
        totalImages: totalImages || 0,
        imagesThisMonth: imagesThisMonth || 0,
        creditsUsedThisMonth,
        currentCredits: userData?.credits || 0,
        mostUsedOperation,
        recentActivity: recentActivity || [],
        averageProcessingTime: 2.3 // Mock data for now
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})