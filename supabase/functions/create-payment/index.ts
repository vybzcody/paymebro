import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encodeURL, createQR } from 'https://esm.sh/@solana/pay@0.2.5'
import { PublicKey } from 'https://esm.sh/@solana/web3.js@1.95.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { amount, description, customerEmail, customerName } = await req.json()

    if (!amount || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, description' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's wallet address
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('wallet_address')
      .eq('id', user.id)
      .single()

    if (!userProfile?.wallet_address) {
      return new Response(
        JSON.stringify({ error: 'User wallet address not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate unique reference
    const reference = crypto.randomUUID()
    const recipientWallet = new PublicKey(userProfile.wallet_address)
    const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU') // Devnet USDC

    // Create Solana Pay URL
    const paymentUrl = encodeURL({
      recipient: recipientWallet,
      amount: amount,
      splToken: usdcMint,
      reference: new PublicKey(reference),
      label: 'AfriPay Payment',
      message: description,
    })

    // Generate QR code
    const qrCode = createQR(paymentUrl)
    const qrCodeDataUrl = await qrCode.getRawData('png')

    // Store payment request in database
    const { data: paymentRequest, error: dbError } = await supabaseClient
      .from('payment_requests')
      .insert({
        user_id: user.id,
        reference,
        amount_usdc: amount,
        description,
        recipient_wallet: userProfile.wallet_address,
        payment_url: paymentUrl.toString(),
        qr_code_url: `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(qrCodeDataUrl)))}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        metadata: {
          customer_email: customerEmail,
          customer_name: customerName,
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        paymentRequest,
        paymentUrl: paymentUrl.toString(),
        qrCode: paymentRequest.qr_code_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
