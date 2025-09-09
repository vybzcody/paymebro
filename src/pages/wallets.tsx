import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { WalletsList } from "@/components/wallets/wallets-list";
import { WithdrawModal } from "@/components/wallets/withdraw-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BalanceService } from "@/lib/wallet/balanceService";

export default function WalletsPage() {
  const { userInfo } = useWeb3AuthUser();
  const { provider } = useWeb3Auth();
  const { accounts } = useSolanaWallet();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // const getUserId = () => {
  //   if (!userInfo) return "unknown";
  //   return userInfo.verifierId || userInfo.aggregateVerifier || userInfo.email || "unknown";
  // };

  const generateEthAddress = (solanaAddress: string) => {
    const hash = solanaAddress.slice(0, 40).toLowerCase();
    const paddedHash = hash.padEnd(40, '0').slice(0, 40);
    const validHex = paddedHash.replace(/[^0-9a-f]/g, '0');
    return "0x" + validHex;
  };

  useEffect(() => {
    const loadWallets = async () => {
      if (!accounts?.[0] || !provider) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const solanaAddress = accounts[0];
        const ethAddress = generateEthAddress(solanaAddress);
        const balanceService = new BalanceService(provider);

        // Fetch real balances
        const [solanaBalance, ethBalance, usdcBalance] = await Promise.all([
          balanceService.getSolanaBalance(solanaAddress),
          balanceService.getEthereumBalance(ethAddress),
          balanceService.getUSDCBalance(solanaAddress)
        ]);

        const walletsData = [
          {
            id: 'solana',
            name: 'Solana Wallet',
            address: solanaAddress,
            balance: solanaBalance.balance,
            currency: 'SOL',
            usdValue: solanaBalance.usdValue,
            network: 'Solana',
            type: 'primary' as const
          },
          {
            id: 'usdc-solana',
            name: 'USDC (Solana)',
            address: solanaAddress,
            balance: usdcBalance.balance,
            currency: 'USDC',
            usdValue: usdcBalance.usdValue,
            network: 'Solana',
            type: 'secondary' as const
          },
          {
            id: 'ethereum',
            name: 'Ethereum Wallet',
            address: ethAddress,
            balance: ethBalance.balance,
            currency: 'ETH',
            usdValue: ethBalance.usdValue,
            network: 'Ethereum',
            type: 'secondary' as const
          }
        ];

        setWallets(walletsData);
      } catch (error) {
        console.error('Failed to load wallet balances:', error);
        // Fallback to mock data
        const solanaAddress = accounts[0];
        const ethAddress = generateEthAddress(solanaAddress);

        setWallets([
          {
            id: 'solana',
            name: 'Solana Wallet',
            address: solanaAddress,
            balance: '0.0000',
            currency: 'SOL',
            usdValue: '$0.00',
            network: 'Solana',
            type: 'primary' as const
          },
          {
            id: 'usdc-solana',
            name: 'USDC (Solana)',
            address: solanaAddress,
            balance: '0.00',
            currency: 'USDC',
            usdValue: '$0.00',
            network: 'Solana',
            type: 'secondary' as const
          },
          {
            id: 'ethereum',
            name: 'Ethereum Wallet',
            address: ethAddress,
            balance: '0.0000',
            currency: 'ETH',
            usdValue: '$0.00',
            network: 'Ethereum',
            type: 'secondary' as const
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWallets();
  }, [accounts, provider]);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="icon" className="mr-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wallets</h1>
            <p className="text-gray-600 mt-2">Manage your cryptocurrency wallets and balances</p>
          </div>
        </div>

        <WalletsList
          wallets={wallets}
          isLoading={isLoading}
          onWithdraw={() => setIsWithdrawModalOpen(true)}
        />

        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          wallets={wallets}
        />
      </div>
    </div>
  );
}

