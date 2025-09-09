import { type Template } from "@/lib/api/templates";
interface EditTemplateModalProps {
    template: Template;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (updates: any) => Promise<void>;
}
export declare function EditTemplateModal({ template, isOpen, onClose, onSubmit }: EditTemplateModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=edit-template-modal.d.ts.map