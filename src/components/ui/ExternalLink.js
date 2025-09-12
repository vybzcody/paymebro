import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
const ExternalLink = ({ href, children, className, showIcon = true, ...props }) => {
    return (_jsxs("a", { href: href, target: "_blank", rel: "noopener noreferrer", className: cn("inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline", className), ...props, children: [children, showIcon && _jsx(ExternalLinkIcon, { className: "h-3 w-3 ml-1" })] }));
};
export default ExternalLink;
