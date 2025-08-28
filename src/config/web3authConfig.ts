import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Get client ID from environment variables or use fallback
const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BHo_Z8iOfv-91EMkE4VRZZyd3xLSPJ8zTGGZDdaMqvVBHBSoy2KLv0te7YojcInFl_EokROy9WElMQGXVjtZBSk";

// Web3Auth configuration
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    uiConfig: {
      appName: 'AfriPay',
      appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
      logoLight: 'https://web3auth.io/images/web3authlog.png',
      logoDark: 'https://web3auth.io/images/web3authlogodark.png',
      defaultLanguage: 'en',
      mode: 'light',
      theme: {
        primary: '#10b981',
      },
      useLogoLoader: true,
      modalZIndex: '99999',
    },
  },
};

export default web3AuthContextConfig;
