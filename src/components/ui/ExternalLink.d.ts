import React from 'react';
interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
    showIcon?: boolean;
}
declare const ExternalLink: React.FC<ExternalLinkProps>;
export default ExternalLink;
//# sourceMappingURL=ExternalLink.d.ts.map