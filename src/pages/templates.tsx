import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useState, useEffect } from "react";
import { templatesApi, type Template } from "@/lib/api/templates";
import { TemplatesList } from "@/components/templates/templates-list";
import { CreateTemplateModal } from "@/components/templates/create-template-modal";
import { EditTemplateModal } from "@/components/templates/edit-template-modal";
import { UseTemplateModal } from "@/components/templates/use-template-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TemplatesPage() {
  const { userInfo } = useWeb3AuthUser();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [usingTemplate, setUsingTemplate] = useState<Template | null>(null);

  const getUserId = () => {
    if (!userInfo) return "unknown";
    return userInfo.verifierId || userInfo.aggregateVerifier || userInfo.email || "unknown";
  };

  const userId = getUserId();

  const fetchTemplates = async () => {
    try {
      const data = await templatesApi.getTemplates(userId);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== "unknown") {
      fetchTemplates();
    }
  }, [userId]);

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await templatesApi.createTemplate({
        ...templateData,
        web3AuthUserId: userId,
      });
      await fetchTemplates();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  };

  const handleEditTemplate = async (templateId: string, updates: any) => {
    try {
      await templatesApi.updateTemplate(templateId, updates, userId);
      await fetchTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templatesApi.deleteTemplate(templateId, userId);
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  };

  const handleUseTemplate = async (templateId: string, customerEmail?: string) => {
    try {
      const result = await templatesApi.createPaymentFromTemplate(templateId, customerEmail, userId);
      setUsingTemplate(null);
      return result;
    } catch (error) {
      console.error('Failed to create payment from template:', error);
      throw error;
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Templates</h1>
            <p className="text-gray-600 mt-2">Create reusable payment templates for faster checkout</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>

        <TemplatesList
          templates={templates}
          isLoading={isLoading}
          onEdit={setEditingTemplate}
          onDelete={handleDeleteTemplate}
          onUse={setUsingTemplate}
        />

        <CreateTemplateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTemplate}
        />

        {editingTemplate && (
          <EditTemplateModal
            template={editingTemplate}
            isOpen={!!editingTemplate}
            onClose={() => setEditingTemplate(null)}
            onSubmit={(updates) => handleEditTemplate(editingTemplate.id, updates)}
          />
        )}

        {usingTemplate && (
          <UseTemplateModal
            template={usingTemplate}
            isOpen={!!usingTemplate}
            onClose={() => setUsingTemplate(null)}
            onSubmit={(customerEmail) => handleUseTemplate(usingTemplate.id, customerEmail)}
          />
        )}
      </div>
    </div>
  );
}
