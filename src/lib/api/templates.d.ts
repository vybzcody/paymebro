export interface Template {
    id: string;
    name: string;
    amount: string;
    currency: string;
    label: string;
    message?: string;
    web3AuthUserId: string;
    createdAt: string;
    isStatic?: boolean;
}
export interface CreateTemplateRequest {
    name: string;
    amount: string;
    currency: string;
    label: string;
    message?: string;
    web3AuthUserId: string;
}
export interface UpdateTemplateRequest {
    name?: string;
    amount?: string;
    currency?: string;
    label?: string;
    message?: string;
}
export declare const templatesApi: {
    getTemplates(userId: string): Promise<Template[]>;
    createTemplate(templateData: CreateTemplateRequest): Promise<Template>;
    updateTemplate(templateId: string, updates: UpdateTemplateRequest, userId: string): Promise<Template>;
    deleteTemplate(templateId: string, userId: string): Promise<boolean>;
    createPaymentFromTemplate(templateId: string, customerEmail?: string, userId?: string): Promise<any>;
};
//# sourceMappingURL=templates.d.ts.map