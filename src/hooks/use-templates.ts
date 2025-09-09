import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi, CreateTemplateRequest } from '@/lib/api/templates';

export const useTemplates = (userId: string) => {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['templates', userId],
    queryFn: () => templatesApi.getUserTemplates(userId),
    enabled: !!userId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Omit<CreateTemplateRequest, 'web3AuthUserId'>) =>
      templatesApi.createTemplate({ ...data, web3AuthUserId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplateRequest> }) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const createPaymentFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, customerEmail }: { templateId: string; customerEmail?: string }) =>
      templatesApi.createPaymentFromTemplate(templateId, customerEmail, userId),
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    createError: createTemplateMutation.error,
    
    updateTemplate: updateTemplateMutation.mutate,
    isUpdating: updateTemplateMutation.isPending,
    
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeleting: deleteTemplateMutation.isPending,
    
    createPaymentFromTemplate: createPaymentFromTemplateMutation.mutate,
    isCreatingPayment: createPaymentFromTemplateMutation.isPending,
    
    refetch: templatesQuery.refetch,
  };
};
