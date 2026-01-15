import { BaseForm } from "./BaseForm.ts";
import type { IEvents } from "../../base/Events.ts";
import { ensureElement } from "../../../utils/utils.ts";

interface ContactsFormData {
    email?: string;
    phone?: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.emailInput.addEventListener('input', () => {
            this.events.emit('form:detailsChange', {
                field: 'email',
                value: this.emailInput.value
            });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('form:detailsChange', {
                field: 'phone',
                value: this.phoneInput.value
            });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    protected onSubmit(): void {
        this.events.emit('form:submitOrder');
    }
}