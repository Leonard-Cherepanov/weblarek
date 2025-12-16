import { IBuyer } from '../../types';

class Buyer {
    private data: IBuyer = {
        payment: null,
        email: null,
        phone: null,
        address: null,
    };

    setData(data: Partial<IBuyer>): void {
        this.data = { ...this.data, ...data };
    }

    getData(): IBuyer {
        return this.data;
    }

    clear(): void {
        this.data = {
            payment: null,
            email: null,
            phone: null,
            address: null,
        };
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
}


export default Buyer;