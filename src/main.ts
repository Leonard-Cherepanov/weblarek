import "./scss/styles.scss";

import { ProductGalleryItem } from "./components/View/Product/ProductGalleryItem.ts";
import { EventEmitter } from "./components/base/Events";
import ProdItems from './components/models/ProdItems';
import Cart from './components/models/Cart';
import Buyer from './components/models/Buyer';
import ApiModul from './components/Api/ApiModul.ts';
import { Api } from './components/base/Api';
import { Gallery } from "./components/View/Gallery.ts";

import { cloneTemplate } from "./utils/utils.ts";
import { API_URL, CDN_URL } from "./utils/constants";

import { IProduct } from "./types";
import { IOrder } from "./types";
import { Modal } from "./components/View/Modal.ts";
import { ProductItemView } from "./components/View/Product/ProductItemView.ts";
import { Header } from "./components/View/Header.ts";
import { ProductCartItemView } from "./components/View/Product/ProductCartItemView.ts";
import { CartView } from "./components/View/CartView.ts";
import { OrderForm } from "./components/View/Forms/OrderForm.ts";
import { ContactsForm } from "./components/View/Forms/ContactsForm.ts";
import { OrderSuccess } from "./components/View/Order.ts";

import { ensureElement } from "./utils/utils.ts";

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

// Создаем экземпляр ProductItemView для превью ОДИН РАЗ
const modalItem = new ProductItemView(
    cloneTemplate(modalItemTmpl),
    {
        onCartBtnClick(event: MouseEvent) {
            events.emit('preview:toggle');
        },
    },
);

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

// Обновляем представление корзины при изменении
events.on("cart:change", () => {
    // Обновляем счетчик в заголовке
    header.render({
        counter: cart.getItemCount(),
    });
    
    // Обновляем представление корзины
    updateBasketView();
});

// Обработчик открытия корзины
events.on("basket:open", () => {
    // Просто показываем уже обновленное представление корзины
    modal.content = cartView.render();
    modal.open();
});

// Обработчики перехода к формам заказа
events.on("cart:paymentDetails", () => {
    const buyerData = buyer.getData();
    
    modal.content = orderForm.render({
        payment: buyerData.payment || null,
        address: buyerData.address || '',
    });
});

events.on("cart:contactDetails", () => {
    const buyerData = buyer.getData();
    
    modal.content = contactsForm.render({
        email: buyerData.email || '',
        phone: buyerData.phone || '',
    });
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
        // Проверяем валидность данных
        if (!buyer.isValid()) {
            contactsForm.setError("Пожалуйста, заполните все обязательные поля");
            return;
        }

        const buyerData = buyer.getData();
        const cartItems = cart.getItems();
        const total = cart.getTotalPrice();

        // Проверяем, что корзина не пуста
        if (cartItems.length === 0) {
            contactsForm.setError("Корзина пуста");
            return;
        }

        // Проверяем, что payment не null (это уже проверено в isValid, но на всякий случай)
        if (!buyerData.payment) {
            contactsForm.setError("Не выбран способ оплаты");
            return;
        }

        const fullOrder: IOrder = {
            payment: buyerData.payment,
            address: buyerData.address as string,
            email: buyerData.email as string,
            phone: buyerData.phone as string,
            total: total,
            items: cartItems.map((item) => item.id),
        };

        const success = await apiModul.sendOrder(fullOrder);

        if (success) {
            modal.content = orderSuccess.render({
                totalPrice: total,
            });
            
            modal.open();

            cart.clear();
            buyer.clear();
        }
    } catch (error) {
        console.error("Ошибка отправки заказа:", error);
        contactsForm.setError("Не удалось отправить заказ. Попробуйте снова.");
    }
});

events.on('form:change', () => {
    const buyerData = buyer.getData();
    const errors = buyer.validate();
    
    // Обновляем формы (если они уже открыты)
    if (orderForm) {
        orderForm.render({
            payment: buyerData.payment || null,
            address: buyerData.address || '',
        });
    }
    
    if (contactsForm) {
        contactsForm.render({
            email: buyerData.email || '',
            phone: buyerData.phone || '',
        });
    }
    
    // Проверяем ошибки валидации для каждой формы
    const hasOrderErrors = Object.keys(errors).some(key => 
        ['payment', 'address'].includes(key)
    );
    const hasContactErrors = Object.keys(errors).some(key => 
        ['email', 'phone'].includes(key)
    );
    
    // Обновляем состояние кнопок
    if (orderForm && orderForm.actionButton) {
        orderForm.actionButton.disabled = hasOrderErrors;
    }
    if (contactsForm && contactsForm.actionButton) {
        contactsForm.actionButton.disabled = hasContactErrors;
    }
    
    // Очищаем ошибки, если нет проблем
    if (orderForm && !hasOrderErrors) {
        orderForm.clearError();
    }
    if (contactsForm && !hasContactErrors) {
        contactsForm.clearError();
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
    
    // Закрываем модальное окно
    modal.close();
});

// Обработка открытия товара в модалке
events.on("product:select", (product: IProduct) => {
    prodItems.setSelectedProduct(product);
    
    let buyButtonText = 'Купить';
    
    if (typeof product.price !== "number") {
        buyButtonText = 'Недоступно';
    } else if (cart.hasItem(product.id)) {
        buyButtonText = 'Удалить из корзины';
    }

    const previewContent = modalItem.render({
        buyAllowed: typeof product.price == "number",
        buyButtonText,
        ...product,
    });

    modal.content = previewContent;
    modal.open();
});