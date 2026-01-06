import {ensureElement} from "../../../utils/utils.ts";
import {Component} from "../../base/Component.ts"
import type {IEvents} from "../../base/Events.ts";

export interface BaseFormData {}

export abstract class BaseForm<T extends BaseFormData = BaseFormData> extends Component<T> {
    protected actionButton: HTMLButtonElement;
    protected errorElement: HTMLElement;
    protected abstract onSubmit(): void;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.actionButton = ensureElement<HTMLButtonElement>('.button', this.container);
        this.errorElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.onSubmit();
        });
    }


    public setError(message: string) {
        this.errorElement.textContent = message;
        this.actionButton.disabled = true;
    }

    public clearError() {
        this.errorElement.textContent = '';
        this.actionButton.disabled = false;
    }
}