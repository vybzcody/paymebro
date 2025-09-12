import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { templatesApi } from "@/lib/api/templates";
import { TemplatesList } from "./templates-list";
import { CreateTemplateModal } from "./create-template-modal";
import { EditTemplateModal } from "./edit-template-modal";
import { UseTemplateModal } from "./use-template-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
export function TemplatesModal({ isOpen, onClose, userId }) {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [usingTemplate, setUsingTemplate] = useState(null);
    const fetchTemplates = async () => {
        try {
            const data = await templatesApi.getTemplates(userId);
            setTemplates(data);
        }
        catch (error) {
            console.error('Failed to fetch templates:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen && userId !== "unknown") {
            setIsLoading(true);
            fetchTemplates();
        }
    }, [isOpen, userId]);
    const handleCreateTemplate = async (templateData) => {
        try {
            await templatesApi.createTemplate({
                ...templateData,
                web3AuthUserId: userId,
            });
            await fetchTemplates();
            setIsCreateModalOpen(false);
        }
        catch (error) {
            console.error('Failed to create template:', error);
            throw error;
        }
    };
    const handleEditTemplate = async (templateId, updates) => {
        try {
            await templatesApi.updateTemplate(templateId, updates, userId);
            await fetchTemplates();
            setEditingTemplate(null);
        }
        catch (error) {
            console.error('Failed to update template:', error);
            throw error;
        }
    };
    const handleDeleteTemplate = async (templateId) => {
        try {
            await templatesApi.deleteTemplate(templateId, userId);
            await fetchTemplates();
        }
        catch (error) {
            console.error('Failed to delete template:', error);
            throw error;
        }
    };
    const handleUseTemplate = async (templateId, customerEmail) => {
        try {
            const result = await templatesApi.createPaymentFromTemplate(templateId, customerEmail, userId);
            setUsingTemplate(null);
            return result;
        }
        catch (error) {
            console.error('Failed to create payment from template:', error);
            throw error;
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "max-w-6xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl", children: "Payment Templates" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Create reusable payment templates for faster checkout" })] }), _jsxs(Button, { onClick: () => setIsCreateModalOpen(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "New Template"] })] }) }), _jsx("div", { className: "mt-6", children: _jsx(TemplatesList, { templates: templates, isLoading: isLoading, onEdit: setEditingTemplate, onDelete: handleDeleteTemplate, onUse: setUsingTemplate }) })] }) }), _jsx(CreateTemplateModal, { isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), onSubmit: handleCreateTemplate }), editingTemplate && (_jsx(EditTemplateModal, { template: editingTemplate, isOpen: !!editingTemplate, onClose: () => setEditingTemplate(null), onSubmit: (updates) => handleEditTemplate(editingTemplate.id, updates) })), usingTemplate && (_jsx(UseTemplateModal, { template: usingTemplate, isOpen: !!usingTemplate, onClose: () => setUsingTemplate(null), onSubmit: (customerEmail) => handleUseTemplate(usingTemplate.id, customerEmail) }))] }));
}
