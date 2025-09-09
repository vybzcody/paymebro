import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useState, useEffect } from "react";
import { WalletsList } from "./wallets-list";
import { WithdrawModal } from "./withdraw-modal";
import { BalanceService } from "@/lib/wallet/balanceService";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletsModal({ isOpen, onClose }: WalletsModalProps) {
  const { userInfo } = useWeb3AuthUser();
  const { provider } = useWeb3Auth();
  const { accounts } = useSolanaWallet();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateEthAddress = (solanaAddress: string) => {
    const hash = solanaAddress.slice(0, 40).toLowerCase();
    const paddedHash = hash.padEnd(40, '0').slice(0, 40);
    const validHex = paddedHash.replace(/[^0-9a-f]/g, '0');
    return "0x" + validHex;
  };

  const loadWallets = async (showRefreshLoader = false) => {
    if (!accounts?.[0] || !provider) {
      setIsLoading(false);
      return;
    }

    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const solanaAddress = accounts[0];
      const ethAddress = generateEthAddress(solanaAddress);
      const balanceService = new BalanceService(provider);

      // Fetch real balances and prices
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
      // Fallback to zero balances
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWallets();
    }
  }, [isOpen, accounts, provider]);

  const handleRefresh = () => {
    loadWallets(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl">My Wallets</DialogTitle>
                <p className="text-gray-600 mt-1">Manage your cryptocurrency wallets and balances</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-6">
            <WalletsList
              wallets={wallets}
              isLoading={isLoading}
              onWithdraw={() => setIsWithdrawModalOpen(true)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        wallets={wallets}
      />
    </>
  );
}
