import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
const CopyIconTooltip = ({ text, className }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            toast.error('Failed to copy');
        }
    };
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: handleCopy, className: className, children: copied ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(Copy, { className: "h-4 w-4" })) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: copied ? 'Copied!' : 'Copy to clipboard' }) })] }) }));
};
export default CopyIconTooltip;
