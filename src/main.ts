import './scss/styles.scss';
import {apiProducts} from '../src/utils/data';
import ProdItems from './components/models/ProdItems';
import Cart from './components/models/Cart';
import Buyer from './components/models/Buyer';
import ApiModul from './components/Api/ApiModul';
import {Api} from './components/base/Api';
import {API_URL} from "./utils/constants";

//создаем экземпляры классов
const prodItems = new ProdItems();
const cart = new Cart();
const buyer = new Buyer();

// Создаем экземпляры Api и ApiModul
const api = new Api(API_URL);
const apiModul = new ApiModul(api);

//проверка методов
prodItems.setProducts(apiProducts.items);
console.log('Массив товаров из каталога:', prodItems.getProducts());
const idToCheck = apiProducts.items[0].id;
console.log('Товар по id:', prodItems.getProductById(idToCheck));

cart.addItem(apiProducts.items[0]);
if (cart.hasItem(idToCheck)) {
    console.log(`Товар с id ${idToCheck} есть в корзине.`);
} else {
    console.log(`Товара с id ${idToCheck} в корзине нет.`);
}

//console.log('Добавление товара в корзину:', cart.addItem())
console.log('Товары в корзине:', cart.getItems());
console.log('Количество товаров в корзине:', cart.getItemCount());
console.log('Общая стоимость:', cart.getTotalPrice());
const itemToRemove = cart.getItems()[0];
console.log('Удаление товара из корзины:', cart.removeItem(itemToRemove));
console.log('Очистка корзины:', cart.clear());


buyer.setData({payment: 'card', email: 'user@example.com', phone: '12345', address: 'г.Москва, ул.Ленина 372'});
console.log('Данные покупателя:', buyer.getData());
console.log('Очистка данных покупки:', buyer.clear());
console.log('Ошибки валидации:', buyer.validate());


const validationErrors = buyer.validate();
if (Object.keys(validationErrors).length > 0) {
    // есть ошибки, показываем пользователю
    console.log('Ошибки валидации:', validationErrors);
} else {
    // ошибок нет, можно продолжать
}

async function fetchAndSaveProducts() {
    try {
        const products = await apiModul.fetchProducts(); // вызов реального API
        prodItems.setProducts(products);
        console.log('Каталог товаров:', prodItems.getProducts());
    } catch (error) {
        console.error('Ошибка получения каталога:', error);
    }
}

fetchAndSaveProducts();