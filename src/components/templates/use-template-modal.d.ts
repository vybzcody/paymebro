import { type Template } from "@/lib/api/templates";
interface UseTemplateModalProps {
    template: Template;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customerEmail?: string) => Promise<any>;
}
export declare function UseTemplateModal({ template, isOpen, onClose, onSubmit }: UseTemplateModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=use-template-modal.d.ts.map