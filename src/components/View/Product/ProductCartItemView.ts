import { ensureElement } from "../../../utils/utils.ts";
import { ProductBaseItemView } from "./ProductBaseItemView.ts";
import {IProduct} from "../../../types";

interface IProductCartItemActions {
    onRemoveCartClick(event: MouseEvent): void;
}

interface ICartProduct extends IProduct {
    index: number;
}

export class ProductCartItemView extends ProductBaseItemView<ICartProduct> {
    protected _index: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected actions: IProductCartItemActions) {
        super(container); // вызываем конструктор базового ProductItem

        this._index = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this._deleteButton.addEventListener('click', this.actions.onRemoveCartClick);
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}