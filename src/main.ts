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
import {IOrder} from "./types";
import {Modal} from "./components/View/Modal.ts";
import {ProductItemView} from "./components/View/Product/ProductItemView.ts";
import {Header} from "./components/View/Header.ts";
import {ProductCartItemView} from "./components/View/Product/ProductCartItemView.ts";
import { CartView } from "./components/View/CartView.ts";
import {OrderForm} from "./components/View/Forms/OrderForm.ts";
import {ContactsForm} from "./components/View/Forms/ContactsForm.ts";
import {OrderSuccess} from "./components/View/Order.ts";

import {ensureElement} from "./utils/utils.ts";

// создаем экземпляры классов
const events = new EventEmitter();
const prodItems = new ProdItems(CDN_URL, events);
const cart = new Cart(events);
const buyer = new Buyer(events);

// Создаем экземпляры Api и ApiModul
const api = new Api(API_URL);
const apiModul = new ApiModul(api);

// Получаем шаблоны
const cardCatalogTmpl = document.querySelector('#card-catalog') as HTMLTemplateElement;
const modalItemTmpl = document.querySelector('#card-preview') as HTMLTemplateElement;
const cartItemTmpl = document.querySelector('#card-basket') as HTMLTemplateElement;
const orderTmpl = document.querySelector('#order') as HTMLTemplateElement;
const contactsFormTmpl = document.querySelector('#contacts') as HTMLTemplateElement;
const orderSuccessTmpl = document.querySelector('#success') as HTMLTemplateElement;
const cartBasketEl = document.querySelector('#basket') as HTMLTemplateElement;

// Создаем экземпляр ProductItemView для превью ОДИН РАЗ
const modalItem = new ProductItemView(
    cloneTemplate(modalItemTmpl),
    {
        onCartBtnClick(event: MouseEvent) {
            // Эмитируем событие, а вся логика будет в обработчике в main.ts
            events.emit('preview:toggle');
        },
    },
);

async function fetchAndSaveProducts() {
    try {
        const products = await apiModul.fetchProducts();
        prodItems.setProducts(products);
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

events.on('catalog:update', renderProductGallery);

// header
const headerEl = ensureElement<HTMLElement>('.header');
const header = new Header(events, headerEl);

// MODAL
const modalTmpl = ensureElement<HTMLElement>('#modal-container');
const modal = new Modal(modalTmpl, events);

const galleryEl = ensureElement<HTMLElement>('.gallery');

// gallery
const gallery = new Gallery(galleryEl);

// cart
const cartView = new CartView(cloneTemplate(cartBasketEl), events);
const orderForm = new OrderForm(cloneTemplate(orderTmpl), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsFormTmpl), events);
const orderSuccess = new OrderSuccess(events, cloneTemplate(orderSuccessTmpl));

// ОБРАБОТКА СОБЫТИЯ cart:change
events.on("cart:change", () => {
    // Обновляем счетчик в шапке
    header.render({
        counter: cart.getItemCount(),
    });
    
    // Обновляем представление корзины
    updateBasketView();
});

// Функция для обновления вида корзины
function updateBasketView() {
    const cartItems = cart.getItems().map((product: IProduct, index) => {
        const cartItem = new ProductCartItemView(
            cloneTemplate(cartItemTmpl),
            {
                onRemoveCartClick() {
                    cart.removeItem(product);
                },
            },
        );

        return cartItem.render({
            index: index + 1,
            ...product,
        });
    });

    cartView.render({
        orderButtonActive: cart.getItemCount() > 0,
        items: cartItems,
        totalPrice: cart.getTotalPrice(),
    });
}

// Обработчик открытия корзины
events.on("basket:open", () => {
    updateBasketView();
    modal.content = cartView.container;
    modal.open();
});

// Обработчики перехода к формам заказа
events.on("cart:paymentDetails", () => {
    const buyerData = buyer.getData();
    
    orderForm.render({
        payment: buyerData.payment,
        address: buyerData.address,
    });
    
    modal.content = orderForm.container;
});

events.on("cart:contactDetails", () => {
    const buyerData = buyer.getData();
    
    contactsForm.render({
        email: buyerData.email,
        phone: buyerData.phone,
    });
    
    modal.content = contactsForm.container;
});

events.on("form:paymentMethodChange", (event: any) => {
    const fields = ['payment', 'address'];
    
    if (fields.includes(event.field)) {
        buyer.setData({ [event.field]: event.value });
    }
});

events.on("form:detailsChange", (event: any) => {
    const fields = ['phone', 'email'];
    
    if (fields.includes(event.field)) {
        buyer.setData({ [event.field]: event.value });
    }
});

events.on("form:submitOrder", async () => {
    try {
        const buyerData = buyer.getData();
        const cartItems = cart.getItems();
        const total = cart.getTotalPrice();

        const fullOrder: IOrder = {
            payment: buyerData.payment,
            address: buyerData.address as string,
            phone: buyerData.phone as string,
            email: buyerData.email as string,
            total: total,
            items: cartItems.map((item) => item.id),
        };

        const success = await apiModul.sendOrder(fullOrder);

        if (success) {
            orderSuccess.render({
                totalPrice: total,
            });
            
            modal.content = orderSuccess.container;
            modal.open();

            cart.clear();
            buyer.clear();
        }
    } catch (error) {
        console.error("Ошибка отправки заказа:", error);
        contactsForm.setError("Не удалось отправить заказа. Попробуйте снова.");
    }
});

events.on('form:change', () => {
    const buyerData = buyer.getData();
    const errors = buyer.validate();
    
    if (orderForm) {
        orderForm.address = buyerData.address || '';
        
        if (buyerData.payment === 'card') {
            const cardButton = orderForm.container.querySelector('button[name="card"]') as HTMLButtonElement;
            cardButton?.click();
        } else if (buyerData.payment === 'cash') {
            const cashButton = orderForm.container.querySelector('button[name="cash"]') as HTMLButtonElement;
            cashButton?.click();
        }
        
        const orderFields = ['payment', 'address'];
        const orderError = Object.entries(errors)
            .find(([key]) => orderFields.includes(key));
        
        orderForm.setError(orderError ? orderError[1] : '');
    }
    
    if (contactsForm) {
        contactsForm.email = buyerData.email || '';
        contactsForm.phone = buyerData.phone || '';
        
        const contactFields = ['email', 'phone'];
        const contactError = Object.entries(errors)
            .find(([key]) => contactFields.includes(key));
        
        contactsForm.setError(contactError ? contactError[1] : '');
    }
});

events.on("order:done", () => {
    modal.close();
});

events.on("modal:close", () => {
    modal.close();
});

// Обработчик кнопки в превью
events.on("preview:toggle", () => {
    const selectedProduct = prodItems.getSelectedProduct();
    
    if (!selectedProduct) return;
    
    if (cart.hasItem(selectedProduct.id)) {
        cart.removeItem(selectedProduct);
    } else {
        cart.addItem(selectedProduct);
    }
    
    // Обновляем превью с новыми данными
    updatePreviewView(selectedProduct);
    
    // Закрываем модальное окно как вы предложили
    modal.close();
});

// Функция обновления превью товара
function updatePreviewView(product: IProduct): void {
    let buyButtonText = 'Купить';
    
    if (typeof product.price !== "number") {
        buyButtonText = 'Недоступно';
    } else if (cart.hasItem(product.id)) {
        buyButtonText = 'Удалить из корзины';
    }

    modalItem.render({
        buyAllowed: typeof product.price == "number",
        buyButtonText,
        ...product,
    });
}

// Обработка открытия товара в модалке
events.on("product:select", (product: IProduct) => {
    // Сохраняем выбранный товар в модели
    prodItems.setSelectedProduct(product);
    
    // Обновляем превью
    updatePreviewView(product);
    
    // Показываем модальное окно
    modal.content = modalItem.container;
    modal.open();
});