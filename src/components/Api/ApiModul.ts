import { IApi, IProduct, IOrder, TOrderResponse, ApiPostMethods } from '../../types';

class ApiModul {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async fetchProducts(): Promise<IProduct[]> {
        const response = await this.api.get<{ items: IProduct[]; total: number }>('/product');
        return response.items;
    }

    async sendOrder(orderData: IOrder): Promise<TOrderResponse> {
        const response = await this.api.post<TOrderResponse>('/order', orderData, 'POST' as ApiPostMethods);
        return response;
    }
}

export default ApiModul;