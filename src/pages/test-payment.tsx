import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

/**
 * Test page to verify payment routes work correctly
 * This can be accessed at /test-payment for development purposes
 */
const TestPaymentPage: React.FC = () => {
    const testReferences = [
        '58dXZq2t5Fkjh6yNJzvfwJaqFPYkof8MGyBJ8Kf16Uyz',
        'HhHzqDKCVN9XXpq4kvwTJkhEz2haqy3FCSGwYRf7We3z',
        'n5F2dLsqUK2hkrwb8g6Vn3r11QLNetytQM5zVKwQzp5',
        '7BfckaZJCnXpdgNdgZErJsCpSK9ZMq25P8grout1had5'
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Page Testing</CardTitle>
                        <p className="text-gray-600">
                            Test the payment page component with various reference IDs
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            {testReferences.map((reference) => (
                                <div key={reference} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            /payment/{reference}
                                        </code>
                                    </div>
                                    <Link href={`/payment/${reference}`}>
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Test
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Testing Notes:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Payment pages should load without authentication</li>
                                <li>• Each reference should show different payment details</li>
                                <li>• QR codes should generate for pending payments</li>
                                <li>• WebSocket connections should work for real-time updates</li>
                                <li>• Status polling should work as fallback</li>
                            </ul>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="font-semibold text-yellow-900 mb-2">Expected Behavior:</h3>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Valid references: Show payment details and QR code</li>
                                <li>• Invalid references: Show "Payment Not Found" error</li>
                                <li>• Confirmed payments: Show success message</li>
                                <li>• Pending payments: Show QR code and monitoring</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TestPaymentPage;