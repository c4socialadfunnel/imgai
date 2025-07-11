import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by Stripe customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (userError || !user) {
          console.error('User not found for customer:', subscription.customer)
          break
        }

        // Upsert subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_subscription_id: subscription.id,
            plan_id: subscription.items.data[0]?.price.id || '',
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (subError) {
          console.error('Failed to upsert subscription:', subError)
        }

        // Add subscription bonus credits based on plan
        const creditBonus = getCreditBonusForPlan(subscription.items.data[0]?.price.id || '')
        if (creditBonus > 0) {
          await supabase.rpc('update_user_credits', {
            p_user_id: user.id,
            p_amount: creditBonus,
            p_transaction_type: 'subscription_bonus',
            p_description: `Monthly subscription bonus: ${creditBonus} credits`
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to cancel subscription:', error)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.billing_reason === 'subscription_cycle') {
          // Find user and add monthly credits
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (!subError && subscription) {
            const creditBonus = getCreditBonusForPlan(subscription.plan_id)
            if (creditBonus > 0) {
              await supabase.rpc('update_user_credits', {
                p_user_id: subscription.user_id,
                p_amount: creditBonus,
                p_transaction_type: 'subscription_bonus',
                p_description: `Monthly subscription renewal: ${creditBonus} credits`
              })
            }
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    )
  }
})

function getCreditBonusForPlan(planId: string): number {
  // Map Stripe price IDs to credit bonuses
  const planCredits: Record<string, number> = {
    'price_starter': 100,    // Starter plan
    'price_pro': 500,        // Pro plan  
    'price_enterprise': 2500 // Enterprise plan
  }
  
  return planCredits[planId] || 0
}