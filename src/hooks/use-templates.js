import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/lib/api/templates';
export const useTemplates = (userId) => {
    const queryClient = useQueryClient();
    const templatesQuery = useQuery({
        queryKey: ['templates', userId],
        queryFn: () => templatesApi.getTemplates(userId),
        enabled: !!userId,
    });
    const createTemplateMutation = useMutation({
        mutationFn: (data) => templatesApi.createTemplate({ ...data, web3AuthUserId: userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', userId] });
        },
    });
    const updateTemplateMutation = useMutation({
        mutationFn: ({ id, data }) => templatesApi.updateTemplate(id, data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', userId] });
        },
    });
    const deleteTemplateMutation = useMutation({
        mutationFn: (id) => templatesApi.deleteTemplate(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates', userId] });
        },
    });
    const createPaymentFromTemplateMutation = useMutation({
        mutationFn: ({ templateId, customerEmail }) => templatesApi.createPaymentFromTemplate(templateId, customerEmail, userId),
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
