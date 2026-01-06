import {ensureElement} from "../../../utils/utils.ts";
import {Component} from "../../base/Component.ts"
import {IProduct} from "../../../types";
import {CategoryKey} from "./ProductItemView.ts";
import {categoryMap} from "../../../utils/constants.ts";

export class ProductBaseItemView<T extends IProduct = IProduct> extends Component<T> {
    private _title: HTMLElement;
    private _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _category?: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', this.container);
        this._price = ensureElement<HTMLElement>('.card__price', this.container);
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    set price(value: number | null) {
        this._price.textContent = value ? `${value} синапсов` : "Бесценно";
    }

    protected _getCategoryClassByCategory(key: CategoryKey): string {
        return categoryMap[key] || '';
    }

    set image(value: string) {
        if (this._image) {
            this.setImage(this._image, value, value);
        }
    }

    set category(value: string) {
        if (this._category) {
            this._category.textContent = value;
            this._setCategoryClass(value as CategoryKey);
        }
    }

    protected _setCategoryClass(value: CategoryKey): void {
        const categoryClass = this._getCategoryClassByCategory(value);
        this._category?.classList.add(categoryClass);
    }
}