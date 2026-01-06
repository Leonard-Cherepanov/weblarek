import {ensureElement} from "../../utils/utils.ts";
import {Component} from "../base/Component.ts"
import type { IEvents } from "../base/Events.ts";

interface CartData {
    items: HTMLElement[];
    totalPrice: number;
    orderButtonActive: boolean;
}

export class CartView extends Component<CartData> {
    protected itemsContainer: HTMLElement;
    protected totalPriceEl: HTMLElement;
    protected orderButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.itemsContainer = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalPriceEl = ensureElement<HTMLElement>('.basket__price', this.container);
        this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.orderButton.addEventListener('click', () => {
            this.events.emit('cart:paymentDetails');
        })
    }

    set items(value: HTMLElement[]) {
        this.itemsContainer.replaceChildren(...value);
    }

    set orderButtonActive(value: boolean) {
        this.orderButton.disabled = !value;
    }

    set totalPrice(value: number) {
        this.totalPriceEl.textContent = `${value} синапсов`;
    }

}