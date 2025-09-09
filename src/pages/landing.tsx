import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Wallet, QrCode, Send, Shield } from 'lucide-react'

import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useEffect } from 'react'

export default function Landing() {

    const { connect } = useWeb3AuthConnect();
    const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <motion.h1
                        className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Welcome to <span className="text-green-600">AfriPay</span>
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        The fastest and most secure way to accept payments across Africa with Solana Pay
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Button
                            // size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                            onClick={connect}
                            disabled={disconnectLoading}
                        >
                            {disconnectLoading ? 'Starting...' : 'Get Started'}
                        </Button>
                        <p className="text-sm text-gray-500 mt-4">
                            Connect your wallet to get started with AfriPay
                        </p>
                    </motion.div>
                </div>

                {/* Features Section */}
                <motion.div
                    className="grid md:grid-cols-3 gap-8 mb-16"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Multi-Chain Wallet</h3>
                            <p className="text-gray-600">
                                Accept payments on Solana, Ethereum, Polygon, and other CCTP-enabled chains
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <QrCode className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant QR Codes</h3>
                            <p className="text-gray-600">
                                Generate payment QR codes in seconds with real-time transaction monitoring
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
                            <p className="text-gray-600">
                                Enterprise-grade security with end-to-end encryption and compliance
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-green-600 font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Get Started</h3>
                            <p className="text-gray-600">
                                Sign up with your social account and start accepting payments instantly
                            </p>
                        </div>
                        <div>
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Create Payment</h3>
                            <p className="text-gray-600">
                                Generate a QR code for any amount in seconds
                            </p>
                        </div>
                        <div>
                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-purple-600 font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
                            <p className="text-gray-600">
                                Receive payments instantly with real-time notifications
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
