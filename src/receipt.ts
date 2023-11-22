import {Product} from './product';

export interface ReceiptItem {
    product: Product;
    quantity: number;
}

export class Receipt {
    public readonly items: Array<ReceiptItem> = [];
    public readonly totalPrice: number = 0;

    constructor(items: Array<ReceiptItem>, totalPrice: number) {
        this.items = items;
        this.totalPrice = totalPrice;
    }
}
