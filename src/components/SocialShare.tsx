import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Copy } from "lucide-react";
import { toast } from 'sonner';

interface SocialShareProps {
  paymentUrl: string;
  amount: number;
  currency: string;
  description?: string;
}

export const SocialShare = ({ paymentUrl, amount, currency, description }: SocialShareProps) => {
  const shareText = `💰 Pay me ${amount} ${currency}${description ? ` for ${description}` : ''} instantly with Solana! ⚡`;
  
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(paymentUrl)}&hashtags=SolanaPay,Web3,AfriPay`;
    window.open(twitterUrl, '_blank');
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${paymentUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${paymentUrl}`);
      toast.success('Payment link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AfriPay Payment Request',
          text: shareText,
          url: paymentUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={shareToTwitter}>
        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Twitter
      </Button>
      
      <Button variant="outline" size="sm" onClick={shareToWhatsApp}>
        <MessageCircle className="h-4 w-4 mr-1" />
        WhatsApp
      </Button>
      
      <Button variant="outline" size="sm" onClick={nativeShare}>
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
      
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
    </div>
  );
};
