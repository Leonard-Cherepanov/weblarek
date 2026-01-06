import { IProduct } from '../../types';
import {IEvents} from "../base/Events.ts";

class Cart {
    private items: IProduct[] = [];

    constructor(private events: IEvents) {}


    getItems(): IProduct[] {
        return this.items;
    }

    addItem(item: IProduct): boolean {
        if (this.hasItem(item.id)) {
            return false;
        }
        this.items.push(item);
        this.events.emit("cart:change");

        return true;
    }

    removeItem(item: IProduct): void {
        this.items = this.items.filter(cartItem => cartItem.id !== item.id);
        this.events.emit("cart:change");
    }

    clear(): void {
        this.items = [];
        this.events.emit("cart:change");
    }

    getTotalPrice(): number {
        return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
    }

    getItemCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some(item => item.id === id);
    }
}

export default Cart;