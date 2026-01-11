import type { Currency } from '@/types';
import { API_VERSION, apiClient } from './client';

export const getCurrencies = async () => {
    const { data } = await apiClient.get<{ currencies: Currency[] }>(
        `/api/${API_VERSION}/currencies`
    );
    return data.currencies;
};

export const updateUserCurrency = async (currencyId: string) => {
    console.log('API Request [updateUserCurrency]:', { currencyId });
    const { data } = await apiClient.put<{ currency: Currency; message: string }>(
        `/api/${API_VERSION}/users/currency`,
        { currencyId }
    );
    return data.currency;
};
