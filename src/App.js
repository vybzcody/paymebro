import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { Route, Switch } from "wouter";
import { Navbar } from "./components/layout/navbar";
import { WebSocketProvider } from "./components/providers/websocket-provider";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Wallets from "./pages/wallets";
import PaymentPage from "./pages/payment";
import TestPaymentPage from "./pages/test-payment";
function App() {
    const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
    const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
    const { userInfo } = useWeb3AuthUser();
    const { accounts } = useSolanaWallet();
    const handleLogout = async () => {
        await disconnect();
    };
    const user = userInfo ? {
        name: userInfo.name,
        email: userInfo.email,
        profileImage: userInfo.profileImage,
    } : null;
    const getUserId = () => {
        if (!userInfo)
            return undefined;
        // Simple type checking
        if (userInfo.verifierId && typeof userInfo.verifierId === 'string')
            return userInfo.verifierId;
        if (userInfo.aggregateVerifier && typeof userInfo.aggregateVerifier === 'string')
            return userInfo.aggregateVerifier;
        if (userInfo.email && typeof userInfo.email === 'string')
            return userInfo.email;
        return undefined;
    };
    const loggedInView = (_jsx(WebSocketProvider, { userId: getUserId(), children: _jsxs("div", { className: "min-h-screen bg-white", children: [_jsx(Navbar, { user: user, address: accounts?.[0], network: "devnet", onLogout: handleLogout }), _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Dashboard }), _jsx(Route, { path: "/wallets", component: Wallets }), _jsx(Route, { children: _jsx(Dashboard, {}) })] })] }) }));
    const unloggedInView = (_jsx("div", { className: "w-full", children: _jsx(Landing, {}) }));
    // Payment pages should be accessible without authentication
    return (_jsx("div", { className: "min-h-screen w-full", children: _jsxs(Switch, { children: [_jsx(Route, { path: "/payment/:reference", component: PaymentPage }), _jsx(Route, { path: "/test-payment", component: TestPaymentPage }), _jsx(Route, { children: isConnected ? loggedInView : unloggedInView })] }) }));
}
export default App;
