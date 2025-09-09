import { Payment } from '@shared/schema';
type OnboardingStep = 'business-info' | 'first-payment' | 'complete';
export declare const useOnboarding: (userId: string) => {
    step: OnboardingStep;
    businessData: any;
    firstPayment: any;
    setStep: import("react").Dispatch<import("react").SetStateAction<OnboardingStep>>;
    completeBusinessInfo: import("@tanstack/react-query").UseMutateFunction<any, Error, OnboardingRequest, unknown>;
    completeBusinessInfoAsync: import("@tanstack/react-query").UseMutateAsyncFunction<any, Error, OnboardingRequest, unknown>;
    isCompletingBusinessInfo: boolean;
    businessInfoError: Error;
    completeFirstPayment: (payment: Payment) => void;
    finishOnboarding: () => Promise<any>;
    checkOnboardingNeeds: (user: any) => {
        showOnboarding: boolean;
        currentStep: any;
        needsBusinessInfo?: undefined;
        needsFirstPayment?: undefined;
    } | {
        showOnboarding: boolean;
        currentStep: string;
        needsBusinessInfo: boolean;
        needsFirstPayment: any;
    };
};
export {};
//# sourceMappingURL=use-onboarding.d.ts.map