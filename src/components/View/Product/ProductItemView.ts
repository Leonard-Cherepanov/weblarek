import {ensureElement} from "../../../utils/utils.ts";
import { ProductBaseItemView } from "./ProductBaseItemView.ts";
import { categoryMap } from "../../../utils/constants.ts";
import {IProduct} from "../../../types";

export type CategoryKey = keyof typeof categoryMap;

interface IProductViewItemActions {
    onCartBtnClick(event: MouseEvent): void;
}

interface IProductViewItemProduct extends IProduct{
    buyButtonText: string;
    buyAllowed: boolean;
}

export class ProductItemView extends ProductBaseItemView<IProductViewItemProduct> {
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _description: HTMLElement;
    protected _buyButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected actions: IProductViewItemActions) {
        super(container);

        this._image = ensureElement<HTMLImageElement> ('.card__image', this.container);
        this._category = ensureElement<HTMLElement>('.card__category', this.container);
        this._description = ensureElement<HTMLElement>('.card__text', this.container);
        this._buyButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

        this._buyButton.addEventListener('click', (event) => {
            actions.onCartBtnClick(event);
        });
    }

    set description (value: string) {
        this._description.textContent = value;
    }

    set buyButtonText (value: string) {
        this._buyButton.textContent = value;
    }

    set buyAllowed(value: boolean) {
        this._buyButton.disabled = !value;
    }

    protected _setCategoryClass(value: CategoryKey): void {
        const categoryClass = this._getCategoryClassByCategory(value as CategoryKey)
        this._category.classList.add(categoryClass);
    }
}