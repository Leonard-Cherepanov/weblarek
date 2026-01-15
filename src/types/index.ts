export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'card' | 'cash' | null;

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBuyer {
    payment: TPayment;
    email: string | null;
    phone: string | null;
    address: string | null;
}

export interface IOrder {
    items: string[];
    payment: 'card' | 'cash'; // Не может быть null при отправке
    address: string;
    email: string;
    phone: string;
    total: number;
}

export type TOrderResponse = {
  id: string,
  total: number
}