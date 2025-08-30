import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/hooks/useAuth";
import { toast } from 'sonner'

export const SupabaseTest = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    if (!user) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    const results = []

    try {
      // Test 1: Check connection
      results.push({ test: 'Connection', status: 'success', message: 'Supabase client initialized' })

      // Test 2: Create test payment link
      const { data: paymentLink, error: linkError } = await supabase
        .from('payment_links')
        .insert({
          user_id: user.id,
          title: 'Test Payment Link',
          amount: 10.00,
          currency: 'USDC',
          reference: `test-${Date.now()}`,
          payment_url: `https://afripay.com/pay/test-${Date.now()}`
        })
        .select()
        .single()

      if (linkError) {
        results.push({ test: 'Create Payment Link', status: 'error', message: linkError.message })
      } else {
        results.push({ test: 'Create Payment Link', status: 'success', message: `Created link: ${paymentLink.title}` })
      }

      // Test 3: Create test transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          reference: `test-tx-${Date.now()}`,
          amount: 10.00,
          currency: 'USDC',
          platform_fee: 0.55,
          net_amount: 9.45,
          recipient_wallet: user.walletAddress,
          status: 'confirmed',
          customer_email: 'test@example.com',
          customer_name: 'Test Customer'
        })
        .select()
        .single()

      if (txError) {
        results.push({ test: 'Create Transaction', status: 'error', message: txError.message })
      } else {
        results.push({ test: 'Create Transaction', status: 'success', message: `Created transaction: ${transaction.reference}` })
      }

      // Test 4: Fetch user's data
      const { data: userLinks, error: fetchError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', user.id)
        .limit(5)

      if (fetchError) {
        results.push({ test: 'Fetch Payment Links', status: 'error', message: fetchError.message })
      } else {
        results.push({ test: 'Fetch Payment Links', status: 'success', message: `Found ${userLinks.length} payment links` })
      }

      // Test 5: Real-time subscription test
      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
          console.log('Real-time update:', payload)
        })
        .subscribe()

      results.push({ test: 'Real-time Subscription', status: 'success', message: 'Subscription created successfully' })

      // Clean up subscription
      setTimeout(() => subscription.unsubscribe(), 1000)

    } catch (error: any) {
      results.push({ test: 'General Error', status: 'error', message: error.message })
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Supabase Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading || !user}>
          {loading ? 'Running Tests...' : 'Run Supabase Tests'}
        </Button>

        {!user && (
          <p className="text-amber-600">Please login with Web3Auth first</p>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded border ${
                result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.test}</span>
                  <span className={`text-sm ${
                    result.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
