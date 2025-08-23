import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, PublicKey } from 'https://esm.sh/@solana/web3.js@1.95.2'
import { findReference, FindReferenceError } from 'https://esm.sh/@solana/pay@0.2.5'

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

    const { reference } = await req.json()

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing reference' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get payment request from database
    const { data: paymentRequest, error: dbError } = await supabaseClient
      .from('payment_requests')
      .select('*')
      .eq('reference', reference)
      .single()

    if (dbError || !paymentRequest) {
      return new Response(
        JSON.stringify({ error: 'Payment request not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const referencePublicKey = new PublicKey(reference)

    try {
      // Find the transaction
      const signatureInfo = await findReference(connection, referencePublicKey, {
        finality: 'confirmed'
      })

      // Get transaction details
      const transaction = await connection.getTransaction(signatureInfo.signature, {
        commitment: 'confirmed'
      })

      if (!transaction) {
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Calculate platform fee
      const { data: platformFee } = await supabaseClient.rpc('calculate_platform_fee', {
        amount_usdc: paymentRequest.amount_usdc,
        user_id: paymentRequest.user_id
      })

      const netAmount = paymentRequest.amount_usdc - (platformFee || 0)

      // Store transaction in database
      const { data: transactionRecord, error: transactionError } = await supabaseClient
        .from('transactions')
        .upsert({
          user_id: paymentRequest.user_id,
          payment_request_id: paymentRequest.id,
          signature: signatureInfo.signature,
          reference: reference,
          amount_usdc: paymentRequest.amount_usdc,
          platform_fee: platformFee || 0,
          net_amount: netAmount,
          sender_wallet: transaction.transaction.message.accountKeys[0].toString(),
          recipient_wallet: paymentRequest.recipient_wallet,
          status: 'confirmed',
          block_time: transaction.blockTime ? new Date(transaction.blockTime * 1000).toISOString() : null,
          confirmation_count: 1,
          description: paymentRequest.description,
          metadata: {
            slot: transaction.slot,
            fee: transaction.meta?.fee,
          }
        }, {
          onConflict: 'signature'
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction storage error:', transactionError)
        return new Response(
          JSON.stringify({ error: 'Failed to store transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          transaction: transactionRecord,
          signature: signatureInfo.signature,
          confirmed: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (error) {
      if (error instanceof FindReferenceError) {
        return new Response(
          JSON.stringify({ 
            confirmed: false, 
            message: 'Transaction not found or not confirmed yet' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      throw error
    }

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
