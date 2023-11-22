import { Product } from './product';
import {Receipt, ReceiptItem} from './receipt';

export class Checkout {

    products: Array<Product> = [];
    receipts: Array<ReceiptItem> = [];

    public scanItem(product: Product): void {
        this.products.push(product);
    }

    public generateReceipt(): Receipt {
        let receiptItem: ReceiptItem = {
            product: { name: '', price: 0 },
            quantity: 0
        }
        let totalQuantity: number = 0;
        let totalPrice: number = 0;

        if (this.products.length > 0) {
            this.products.map((product: Product) => {
                receiptItem.product = product;
                receiptItem.quantity = 1;
                this.receipts.push(receiptItem);
                totalQuantity += 1;
                totalPrice += receiptItem.product.price;
            });
        } else {
            this.receipts = [];
        }
        return new Receipt(this.receipts, totalPrice);
    }
}
