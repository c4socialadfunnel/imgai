import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminUserRequest {
  action: 'ban' | 'unban' | 'adjust_credits' | 'update_role'
  targetUserId: string
  data?: {
    credits?: number
    role?: 'admin' | 'user'
    reason?: string
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

    // Get admin user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || adminUser?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, targetUserId, data = {} }: AdminUserRequest = await req.json()

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let updateData: any = { updated_at: new Date().toISOString() }
    let logAction = action
    let logDetails: any = { targetUserId }

    switch (action) {
      case 'ban':
        updateData.banned_at = new Date().toISOString()
        logDetails.reason = data.reason
        break

      case 'unban':
        updateData.banned_at = null
        break

      case 'adjust_credits':
        if (typeof data.credits !== 'number') {
          return new Response(
            JSON.stringify({ error: 'Credits amount is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        updateData.credits = targetUser.credits + data.credits
        logDetails.creditChange = data.credits
        logDetails.newBalance = updateData.credits
        
        // Record credit transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: targetUserId,
            amount: data.credits,
            transaction_type: 'admin_adjustment',
            description: `Admin credit adjustment: ${data.credits > 0 ? '+' : ''}${data.credits}`
          })
        break

      case 'update_role':
        if (!data.role || !['admin', 'user'].includes(data.role)) {
          return new Response(
            JSON.stringify({ error: 'Valid role is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        updateData.role = data.role
        logDetails.newRole = data.role
        logDetails.previousRole = targetUser.role
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log admin action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: logAction,
        target_user_id: targetUserId,
        details: logDetails
      })

    return new Response(
      JSON.stringify({
        success: true,
        action,
        targetUserId,
        message: `User ${action} completed successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin user management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})