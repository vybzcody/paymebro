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
    if (!userInfo) return undefined;
    return userInfo.verifierId || userInfo.aggregateVerifier || userInfo.email || undefined;
  };

  const loggedInView = (
    <WebSocketProvider userId={getUserId()}>
      <div className="min-h-screen bg-white">
        <Navbar
          user={user}
          address={accounts?.[0]}
          network="devnet"
          onLogout={handleLogout}
        />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/wallets" component={Wallets} />
          <Route>
            <Dashboard />
          </Route>
        </Switch>
      </div>
    </WebSocketProvider>
  );

  const unloggedInView = (
    <div className="w-full">
      <Landing />
    </div>
  );

  // Payment pages should be accessible without authentication
  return (
    <div className="min-h-screen w-full">
      <Switch>
        <Route path="/payment/:reference" component={PaymentPage} />
        <Route path="/test-payment" component={TestPaymentPage} />
        <Route>
          {isConnected ? loggedInView : unloggedInView}
        </Route>
      </Switch>
    </div>
  );
}

export default App;
