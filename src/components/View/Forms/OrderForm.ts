import { BaseForm } from "./BaseForm.ts";
import type { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

interface OrderFormData {
    payment?: 'card' | 'cash' | null;
    address?: string;
}

export class OrderForm extends BaseForm<OrderFormData> {
    private cardButton: HTMLButtonElement;
    private cashButton: HTMLButtonElement;
    private inputAddress: HTMLInputElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.inputAddress = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            this.selectPayment('card');
            this.events.emit('form:paymentMethodChange', {
                field: 'payment',
                value: 'card',
            });
        });

        this.cashButton.addEventListener('click', () => {
            this.selectPayment('cash');
            this.events.emit('form:paymentMethodChange', {
                field: 'payment',
                value: 'cash',
            });
        });

        this.inputAddress.addEventListener('input', () => {
            this.events.emit('form:paymentMethodChange', {
                field: 'address',
                value: this.inputAddress.value
            });
        });
    }

    set payment(value: 'card' | 'cash' | null) {
        if (value === 'card' || value === 'cash') {
            this.selectPayment(value);
        }
    }

    set address(value: string) {
        this.inputAddress.value = value;
    }

    protected onSubmit(): void {
        this.events.emit('cart:contactDetails');
    }

    public selectPayment(method: 'card' | 'cash'): void {
        this.cardButton.classList.toggle('button_alt-active', method === 'card');
        this.cashButton.classList.toggle('button_alt-active', method === 'cash');
    }
}