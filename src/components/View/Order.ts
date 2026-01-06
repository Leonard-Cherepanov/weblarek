import {ensureElement} from "../../utils/utils.ts";
import {Component} from "../base/Component.ts"
import type { IEvents } from "../base/Events.ts";

interface IOrderSuccess {
    totalPrice: number;
}

export class OrderSuccess extends Component<IOrderSuccess> {
    protected description: HTMLElement;
    protected doneButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.description = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.doneButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        this.doneButton.addEventListener('click', () => {
            this.events.emit('order:done');
        })
    }

    set totalPrice (value: number) {
        this.description.textContent = `Списано ${value} синапсов`;
    }
}