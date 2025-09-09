import { useState, useEffect } from "react";
import { templatesApi, type Template } from "@/lib/api/templates";
import { TemplatesList } from "./templates-list";
import { CreateTemplateModal } from "./create-template-modal";
import { EditTemplateModal } from "./edit-template-modal";
import { UseTemplateModal } from "./use-template-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function TemplatesModal({ isOpen, onClose, userId }: TemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [usingTemplate, setUsingTemplate] = useState<Template | null>(null);

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
    if (isOpen && userId !== "unknown") {
      setIsLoading(true);
      fetchTemplates();
    }
  }, [isOpen, userId]);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl">Payment Templates</DialogTitle>
                <p className="text-gray-600 mt-1">Create reusable payment templates for faster checkout</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-6">
            <TemplatesList
              templates={templates}
              isLoading={isLoading}
              onEdit={setEditingTemplate}
              onDelete={handleDeleteTemplate}
              onUse={setUsingTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
