import { type Template } from "@/lib/api/templates";
interface TemplatesListProps {
    templates: Template[];
    isLoading: boolean;
    onEdit: (template: Template) => void;
    onDelete: (templateId: string) => void;
    onUse: (template: Template) => void;
}
export declare function TemplatesList({ templates, isLoading, onEdit, onDelete, onUse }: TemplatesListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=templates-list.d.ts.map