import {ensureElement} from "../../../utils/utils.ts";
import { ProductBaseItemView } from "./ProductBaseItemView.ts";
import {CategoryKey} from "./ProductItemView.ts";

interface IProductGalleryItemActions {
    onClick(event: MouseEvent): void;
}

export class ProductGalleryItem extends ProductBaseItemView {
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;

    constructor(container: HTMLElement, protected actions: IProductGalleryItemActions) {
        super(container);

        this._image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this._category = ensureElement<HTMLElement>('.card__category', this.container);
        this.container.addEventListener('click', actions.onClick);
    }

    protected _setCategoryClass(value: CategoryKey): void {
        const categoryClass = this._getCategoryClassByCategory(value as CategoryKey)
        this._category.classList.add(categoryClass);
    }
}