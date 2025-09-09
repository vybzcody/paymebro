interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
}
export declare function ConfirmationModal({ open, onOpenChange, title, description, confirmText, cancelText, onConfirm, variant }: ConfirmationModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=confirmation-modal.d.ts.map