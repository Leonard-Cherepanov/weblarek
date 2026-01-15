import { IBuyer } from '../../types';
import { IOrder } from '../../types';
import { IEvents } from "../base/Events.ts";

class Buyer {
    private data: IBuyer = {
        payment: null,
        email: '',
        phone: '',
        address: '',
    };

    constructor(private events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        this.data = { ...this.data, ...data };
        this.events.emit("form:change");
    }

    getData(): IBuyer {
        return this.data;
    }

    getOrderData(): IOrder {
        // Проверяем, что все обязательные поля заполнены
        if (!this.data.payment || !this.data.address || !this.data.email || !this.data.phone) {
            throw new Error('Не все обязательные поля заполнены');
        }

        return {
            payment: this.data.payment,
            address: this.data.address,
            email: this.data.email,
            phone: this.data.phone,
            items: [], // Будет добавлено позже
            total: 0, // Будет добавлено позже
        };
    }

    clear(): void {
        this.data = {
            payment: null,
            email: '',
            phone: '',
            address: '',
        };

        this.events.emit("form:change");
    }

    validate(): { [key in keyof IBuyer]?: string } {
        const errors: { [key in keyof IBuyer]?: string } = {};

        if (!this.data.payment) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (!this.data.email) {
            errors.email = 'Укажите емэйл';
        }
        if (!this.data.phone) {
            errors.phone = 'Укажите телефон';
        }
        if (!this.data.address) {
            errors.address = 'Укажите адрес доставки';
        }
        return errors;
    }

    isValid(): boolean {
        const errors = this.validate();
        return Object.keys(errors).length === 0;
    }
}

export default Buyer;