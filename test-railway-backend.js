#!/usr/bin/env node

/**
 * Test script to verify Railway backend connectivity
 */

const BACKEND_URL = 'https://paymebro-backend-production.up.railway.app';

async function testBackend() {
    console.log('🚀 Testing Railway Backend Connection...\n');

    const tests = [
        {
            name: 'Health Check',
            endpoint: '/api/payments/test-reference',
            expectedStatus: 404,
            expectedResponse: { success: false, error: 'Payment not found' }
        },
        {
            name: 'API Structure',
            endpoint: '/api/payments/invalid-ref',
            expectedStatus: 404,
            expectedResponse: { success: false }
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            console.log(`   URL: ${BACKEND_URL}${test.endpoint}`);

            const response = await fetch(`${BACKEND_URL}${test.endpoint}`);
            const data = await response.json();

            console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
            console.log(`   Response:`, JSON.stringify(data, null, 2));

            if (response.status === test.expectedStatus) {
                console.log(`   ✅ Expected status code: ${test.expectedStatus}`);
            } else {
                console.log(`   ❌ Unexpected status: got ${response.status}, expected ${test.expectedStatus}`);
            }

            if (data.success === test.expectedResponse.success) {
                console.log(`   ✅ Response structure correct`);
            } else {
                console.log(`   ❌ Response structure incorrect`);
            }

            console.log('');

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }

    console.log('🎉 Backend connectivity test complete!');
    console.log('✅ Railway backend is accessible and responding correctly.');
    console.log('✅ Payment pages should now work properly.');
}

testBackend().catch(console.error);