import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { appConfig } from '@/lib/config';
export const useOnboarding = (userId) => {
    const [step, setStep] = useState('business-info');
    const [businessData, setBusinessData] = useState(null);
    const [firstPayment, setFirstPayment] = useState(null);
    const completeBusinessInfoMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`${appConfig.apiUrl}/users/onboarding/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    web3AuthUserId: userId,
                    businessName: data.businessName,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    country: data.country,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to complete business information');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to complete business information');
            }
            return result;
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                setBusinessData(variables);
                setStep('first-payment');
            }
        },
    });
    const completeFirstPayment = (payment) => {
        setFirstPayment(payment);
        setStep('complete');
    };
    const finishOnboarding = async () => {
        // TODO: Implement API call to mark onboarding as complete
        try {
            const response = await fetch(`${appConfig.apiUrl}/users/onboarding/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    web3AuthUserId: userId,
                    onboardingCompleted: true,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to complete onboarding');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to complete onboarding');
            }
            setStep('complete');
            return result.user;
        }
        catch (error) {
            console.error('Failed to finish onboarding:', error);
            throw error;
        }
    };
    const checkOnboardingNeeds = (user) => {
        if (!user)
            return { showOnboarding: false, currentStep: null };
        const needsOnboarding = !user.onboarding_completed;
        const hasBusinessInfo = user.business_name && user.first_name;
        return {
            showOnboarding: needsOnboarding,
            currentStep: needsOnboarding ?
                (!hasBusinessInfo ? 'business-info' : 'first-payment') :
                'complete',
            needsBusinessInfo: needsOnboarding && !hasBusinessInfo,
            needsFirstPayment: needsOnboarding && hasBusinessInfo
        };
    };
    return {
        step,
        businessData,
        firstPayment,
        setStep,
        completeBusinessInfo: completeBusinessInfoMutation.mutate,
        completeBusinessInfoAsync: completeBusinessInfoMutation.mutateAsync,
        isCompletingBusinessInfo: completeBusinessInfoMutation.isPending,
        businessInfoError: completeBusinessInfoMutation.error,
        completeFirstPayment,
        finishOnboarding,
        checkOnboardingNeeds,
    };
};
