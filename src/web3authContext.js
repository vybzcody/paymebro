/// <reference types="vite/client" />
// IMP START - Quick Start
import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
// IMP END - Quick Start
// IMP START - Dashboard Registration
const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BFcLTVqWlTSpBBaELDPSz4_LFgG8Nf8hEltPlf3QeUG_88GDrQSw82fSjjYj5x4F3ys3ghMq8-InU7Azx7NbFSs"; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration
const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
    rpcTarget: "https://api.devnet.solana.com", // This is the public RPC we have added, please pass on your own endpoint while creating an app
    displayName: "Solana Devnet",
    blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
    ticker: "SOL",
    tickerName: "Solana",
    logo: "https://images.toruswallet.io/solana.svg",
};
const privateKeyProvider = new SolanaPrivateKeyProvider({
    config: { chainConfig },
});
// IMP START - Instantiate SDK
const web3AuthContextConfig = {
    web3AuthOptions: {
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        // chains: [chainConfig], // Pass array of custom chains
        // privateKeyProvider,
    }
};
// IMP END - Instantiate SDK
export default web3AuthContextConfig;
