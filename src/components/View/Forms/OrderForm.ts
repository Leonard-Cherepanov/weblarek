import { BaseForm } from "./BaseForm.ts";
import type { IEvents } from "../../base/Events.ts";
import {ensureElement} from "../../../utils/utils.ts";

export class OrderForm extends BaseForm {
    private cardButton: HTMLButtonElement;
    private cashButton: HTMLButtonElement;
    private inputAddress: HTMLInputElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.inputAddress = ensureElement<HTMLInputElement>('input[name="address"]', this.container)

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

    set card(value: string) {
        this.cardButton.value = value;
    }

    set cash(value: string) {
        this.cashButton.value = value;
    }

    set address(value:string) {
        this.inputAddress.value = value;
    }

    protected onSubmit(): void {
        this.events.emit('cart:contactDetails');
    }

    private selectPayment(method: 'card' | 'cash') {
        this.cardButton.classList.toggle('button_alt-active', method === 'card');
        this.cashButton.classList.toggle('button_alt-active', method === 'cash');
    }
}