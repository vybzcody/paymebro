import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { templatesApi } from "@/lib/api/templates";
import { TemplatesList } from "@/components/templates/templates-list";
import { CreateTemplateModal } from "@/components/templates/create-template-modal";
import { EditTemplateModal } from "@/components/templates/edit-template-modal";
import { UseTemplateModal } from "@/components/templates/use-template-modal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function TemplatesPage() {
    const { userInfo } = useWeb3AuthUser();
    const { toast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [usingTemplate, setUsingTemplate] = useState(null);
    // Memoize user ID to prevent unnecessary re-renders
    const userId = useMemo(() => {
        if (!userInfo)
            return "unknown";
        // Use email as the primary identifier for Web3Auth users
        return userInfo.email || userInfo.name || "unknown";
    }, [userInfo]);
    const fetchTemplates = useCallback(async () => {
        if (userId === "unknown")
            return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await templatesApi.getTemplates(userId);
            setTemplates(data);
        }
        catch (error) {
            console.error('Failed to fetch templates:', error);
            setError('Failed to load templates');
            toast({
                title: "Error",
                description: "Failed to load templates",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, toast]);
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);
    const handleCreateTemplate = useCallback(async (templateData) => {
        try {
            await templatesApi.createTemplate({
                ...templateData,
                web3AuthUserId: userId,
            });
            await fetchTemplates();
            setIsCreateModalOpen(false);
            toast({
                title: "Success",
                description: "Template created successfully",
            });
        }
        catch (error) {
            console.error('Failed to create template:', error);
            toast({
                title: "Error",
                description: "Failed to create template",
                variant: "destructive",
            });
            throw error;
        }
    }, [userId, fetchTemplates, toast]);
    const handleEditTemplate = useCallback(async (templateId, updates) => {
        try {
            await templatesApi.updateTemplate(templateId, updates, userId);
            await fetchTemplates();
            setEditingTemplate(null);
            toast({
                title: "Success",
                description: "Template updated successfully",
            });
        }
        catch (error) {
            console.error('Failed to update template:', error);
            toast({
                title: "Error",
                description: "Failed to update template",
                variant: "destructive",
            });
            throw error;
        }
    }, [userId, fetchTemplates, toast]);
    const handleDeleteTemplate = useCallback(async (templateId) => {
        try {
            await templatesApi.deleteTemplate(templateId, userId);
            await fetchTemplates();
            toast({
                title: "Success",
                description: "Template deleted successfully",
            });
        }
        catch (error) {
            console.error('Failed to delete template:', error);
            toast({
                title: "Error",
                description: "Failed to delete template",
                variant: "destructive",
            });
            throw error;
        }
    }, [userId, fetchTemplates, toast]);
    const handleUseTemplate = useCallback(async (templateId, customerEmail) => {
        try {
            const result = await templatesApi.createPaymentFromTemplate(templateId, customerEmail, userId);
            setUsingTemplate(null);
            toast({
                title: "Success",
                description: "Payment created from template",
            });
            return result;
        }
        catch (error) {
            console.error('Failed to create payment from template:', error);
            toast({
                title: "Error",
                description: "Failed to create payment from template",
                variant: "destructive",
            });
            throw error;
        }
    }, [userId, toast]);
    if (!userInfo) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading templates..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: error })] }), _jsxs(Button, { onClick: fetchTemplates, className: "mt-4", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Retry"] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Payment Templates" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Create reusable payment templates for faster checkout" })] }), _jsxs(Button, { onClick: () => setIsCreateModalOpen(true), className: "flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "New Template"] })] }), _jsx(TemplatesList, { templates: templates, isLoading: isLoading, onEdit: setEditingTemplate, onDelete: handleDeleteTemplate, onUse: setUsingTemplate }), _jsx(CreateTemplateModal, { isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), onSubmit: handleCreateTemplate }), editingTemplate && (_jsx(EditTemplateModal, { template: editingTemplate, isOpen: !!editingTemplate, onClose: () => setEditingTemplate(null), onSubmit: (updates) => handleEditTemplate(editingTemplate.id, updates) })), usingTemplate && (_jsx(UseTemplateModal, { template: usingTemplate, isOpen: !!usingTemplate, onClose: () => setUsingTemplate(null), onSubmit: (customerEmail) => handleUseTemplate(usingTemplate.id, customerEmail) }))] }) }));
}
