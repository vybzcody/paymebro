import { CreateTemplateRequest } from '@/lib/api/templates';
export declare const useTemplates: (userId: string) => {
    templates: any;
    isLoading: boolean;
    error: Error;
    createTemplate: import("@tanstack/react-query").UseMutateFunction<import("@/lib/api/templates").Template, Error, Omit<CreateTemplateRequest, "web3AuthUserId">, unknown>;
    isCreating: boolean;
    createError: Error;
    updateTemplate: import("@tanstack/react-query").UseMutateFunction<import("@/lib/api/templates").Template, Error, {
        id: string;
        data: Partial<CreateTemplateRequest>;
    }, unknown>;
    isUpdating: boolean;
    deleteTemplate: import("@tanstack/react-query").UseMutateFunction<boolean, Error, string, unknown>;
    isDeleting: boolean;
    createPaymentFromTemplate: import("@tanstack/react-query").UseMutateFunction<any, Error, {
        templateId: string;
        customerEmail?: string;
    }, unknown>;
    isCreatingPayment: boolean;
    refetch: (options?: import("@tanstack/query-core").RefetchOptions) => Promise<import("@tanstack/query-core").QueryObserverResult<any, Error>>;
};
//# sourceMappingURL=use-templates.d.ts.map