import React from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  showIcon?: boolean;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ 
  href, 
  children, 
  className, 
  showIcon = true,
  ...props 
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline",
        className
      )}
      {...props}
    >
      {children}
      {showIcon && <ExternalLinkIcon className="h-3 w-3 ml-1" />}
    </a>
  );
};

export default ExternalLink;
