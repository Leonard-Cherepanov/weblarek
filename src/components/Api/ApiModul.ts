import { IApi, IProduct, TOrderResponse, ApiPostMethods } from '../../types';

class ApiModul {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    async fetchProducts(): Promise<IProduct[]> {
        const response = await this.api.get<{ items: IProduct[] }>('/product');
        return response.items;
    }

    async sendOrder(orderData: TOrderResponse): Promise<TOrderResponse> {
        await this.api.post('/order', orderData, 'POST' as ApiPostMethods);
        return { 
            id: "",           
            total: 0
        };
    }
}

export default ApiModul;