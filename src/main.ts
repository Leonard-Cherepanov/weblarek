import "./scss/styles.scss";

import { ProductGalleryItem } from "./components/View/Product/ProductGalleryItem.ts";
import { EventEmitter } from "./components/base/Events";
import ProdItems from './components/models/ProdItems';
import Cart from './components/models/Cart';
import Buyer from './components/models/Buyer';
import ApiModul from './components/Api/ApiModul.ts';
import {Api} from './components/base/Api';
import {Gallery} from "./components/View/Gallery.ts";

import {cloneTemplate} from "./utils/utils.ts";
import {API_URL, CDN_URL} from "./utils/constants";

import {IProduct} from "./types";
import {Modal} from "./components/View/Modal.ts";
import {ProductItemView} from "./components/View/Product/ProductItemView.ts";
import {Header} from "./components/View/Header.ts";
import {ProductCartItemView} from "./components/View/Product/ProductCartItemView.ts";
import { CartView } from "./components/View/CartView.ts";
import {OrderForm} from "./components/View/Forms/OrderForm.ts";
import {ContactsForm} from "./components/View/Forms/ContactsForm.ts";
import {OrderSuccess} from "./components/View/Order.ts";

import {ensureElement} from "./utils/utils.ts";

//создаем экземпляры классов
const events = new EventEmitter();
const prodItems = new ProdItems(CDN_URL, events);
const cart = new Cart(events);
const buyer = new Buyer(events);

// Создаем экземпляры Api и ApiModul
const api = new Api(API_URL);
const apiModul = new ApiModul(api);


async function fetchAndSaveProducts() {
    try {
        const products = await apiModul.fetchProducts();
        prodItems.setProducts(products); // Модель сама эмитит событие
    } catch (error) {
        console.error('Ошибка получения каталога:', error);
    }
}

fetchAndSaveProducts();


function renderProductGallery(products: IProduct[]): void {
    const galleryItems = products.map((product: IProduct) => {
        const cardView = new ProductGalleryItem(
            cloneTemplate(cardCatalogTmpl),
            {
                onClick: () => events.emit('product:select', product),
            }
        );
        return cardView.render(product);
    });

    gallery.render({ catalog: galleryItems });
}

events.on('catalog:updated', renderProductGallery);

// header
// const headerEl = document.querySelector('.header') as HTMLElement;
const headerEl = ensureElement<HTMLElement>('.header');
const header = new Header(events, headerEl);
///

/// MODAL
const modalTmpl = ensureElement<HTMLElement>('#modal-container');
const modal = new Modal(modalTmpl, events);
////

const galleryEl = ensureElement<HTMLElement>('.gallery');
const cardCatalogTmpl = document.querySelector('#card-catalog') as HTMLTemplateElement;
const modalItemTmpl = document.querySelector('#card-preview') as HTMLTemplateElement;

// gallery
const gallery = new Gallery(galleryEl);

// cart
const cartItemTmpl = document.querySelector('#card-basket') as HTMLTemplateElement;
const orderTmpl = document.querySelector('#order') as HTMLTemplateElement;
const contactsFormTmpl = document.querySelector('#contacts') as HTMLTemplateElement;
const orderSuccessTmpl = document.querySelector('#success') as HTMLTemplateElement;
const cartBasketEl = document.querySelector('#basket') as HTMLTemplateElement;
const cartView = new CartView(cloneTemplate(cartBasketEl), events);
const orderForm = new OrderForm(cloneTemplate(orderTmpl), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsFormTmpl), events);
const orderSuccess = new OrderSuccess(events, cloneTemplate(orderSuccessTmpl));


// events

function renderBasketModal() {
    const cartItems = cart.getItems().map((product: IProduct, index) => {
        const cartItem = new ProductCartItemView(
            cloneTemplate(cartItemTmpl),
            {
                onRemoveCartClick() {
                    cart.removeItem(product);
                    events.emit("cart:change");

                    renderBasketModal();
                },
            },
        );

        return cartItem.render({
            index: index + 1,
            ...product,
        });
    });

    modal.content = cartView.render({
        orderButtonActive: cart.getItemCount() > 0,
        items: cartItems,
        totalPrice: cart.getTotalPrice(),
    });
}

events.on("basket:open", () => {
    modal.open()
});

events.on("cart:paymentDetails", () => {
    const buyerData = buyer.getData();
    modal.content = orderForm.render({
        payment: buyerData.payment,
        address: buyerData.address,
    });
});

events.on("cart:contactDetails", () => {
    const buyerData = buyer.getData();
    modal.content = contactsForm.render({
        email: buyerData.email,
        phone: buyerData.phone,
    });
});

events.on("form:paymentMethodChange", (event: any) => {
    const fields = ['payment', 'address'];

    if (fields.includes(event.field)) {
        buyer.setData({ [event.field]: event.value });
    }

    const errors = buyer.validate();
    const formErrors = Object.entries(errors)
        .filter(([key]) => fields.includes(key));

    if (formErrors.length) {
        orderForm.setError(formErrors[0][1]);

        return;
    }

    orderForm.clearError();
});

events.on("form:detailsChange", (event: any) => {
    const fields = ['phone', 'email'];

    if (fields.includes(event.field)) {
        buyer.setData({ [event.field]: event.value });
    }

    const errors = buyer.validate();
    const formErrors = Object.entries(errors)
        .filter(([key]) => fields.includes(key));

    if (formErrors.length) {
        contactsForm.setError(formErrors[0][1]);

        return;
    }

    contactsForm.clearError();
});

events.on("form:submitOrder", async () => {
    try {
        const buyerData = buyer.getData();
        const cartItems = cart.getItems();
        const total = cart.getTotalPrice();

        const fullOrder = {
            payment: buyerData.payment,
            address: buyerData.address,
            phone: buyerData.phone,
            email: buyerData.email,
            total: total,
            items: cartItems.map((item) => item.id),
        };

        const success = await apiModul.sendOrder(fullOrder);

        if (success) {
            modal.content = orderSuccess.render({
                totalPrice: total,
            });

            cart.clear();
            buyer.clear();
        }
    } catch (error) {
        console.error("Ошибка отправки заказа:", error);
        contactsForm.setError("Не удалось отправить заказ. Попробуйте снова.");
    }
});


events.on("order:done", () => {
    modal.close();
});

events.on("modal:close", () => {
    modal.close();
});

events.on("cart:modalAddItem", (product: IProduct) => {
    cart.addItem(product);
    renderProductViewItemModal(product);
});

events.on("cart:modalRemoveItem", (product: IProduct) => {
    cart.removeItem(product);
    renderProductViewItemModal(product);
});

events.on("cart:change", () => {
    header.render({
        counter: cart.getItemCount(),
    });
});

function renderProductViewItem(product: IProduct): HTMLElement {
    const modalItem = new ProductItemView(
        cloneTemplate(modalItemTmpl),
        {
            onCartBtnClick() {
                let event = "cart:modalAddItem";

                if (cart.hasItem(product.id)) {
                    event = "cart:modalRemoveItem";
                }

                events.emit(event, product);
            },
        },
    );

    let buyButtonText = 'Купить';

    if (typeof product.price !== "number") {
        buyButtonText = 'Недоступно';
    } else if (cart.hasItem(product.id)) {
        buyButtonText = 'Удалить из корзины';
    }

    return modalItem.render({
        buyAllowed: typeof product.price == "number",
        buyButtonText,
        ...product,
    });
}

function renderProductViewItemModal(product: IProduct) {
    modal.content = renderProductViewItem(product);
}

events.on("product:select", (product: IProduct) => {
    renderProductViewItemModal(product);
    modal.open();

    console.log("Каталог — карточка нажата!", product);
});