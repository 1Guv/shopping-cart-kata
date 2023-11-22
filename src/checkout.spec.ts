import {Checkout} from './checkout';
import {Receipt, ReceiptItem} from './receipt';
import {Product, ProductFixedDiscounts} from './product';

function lookupReceiptItem(receipt: Receipt, id: string): ReceiptItem {
    const item = receipt.items.find((x) => x.product.name === id)
    if (!item) {
        throw new Error(`The receipt does not contain a "${id}" item.`)
    }
    return item;
}

function promotionBuyXGetOneFree(receipt: Receipt, howManyToBuy: number): Receipt {
    if (receipt.items.length !== howManyToBuy) {
        throw new Error(`The receipt does not contain ${howManyToBuy} items.`)
    }

    if (receipt.items.every((val, i , array) => val === array[0])) {
        let newTotalPrice = parseFloat((receipt.items[0].product.price.toString())) * parseFloat((howManyToBuy - 1).toString());
        return new Receipt(
            receipt.items,
            +(newTotalPrice.toFixed(2))
        );
    } else {
        throw new Error(`The receipt does not contain 2 of the same items for this offer.`)
    };
}

function percentageDiscount(percentage: number, receipt: Receipt): Receipt {
    if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage should be between 0 and 100');
    }
    const discountAmount = (receipt.items[0].product.price * percentage) / 100;
    const discountedPrice = receipt.items[0].product.price - discountAmount;
    const newTotalPrice = discountedPrice * (receipt.items.length > 0 ? receipt.items.length : 1);

    return new Receipt(receipt.items, newTotalPrice);
}

function percentageDiscountDependingOnQuantity(percentage: number, receipt: Receipt, discountOnQuantity: number): Receipt {
    let newReceipt: Receipt;
    if (receipt.items.length > 0 && receipt.items.length >= discountOnQuantity){
        return newReceipt = percentageDiscount(percentage, receipt);
    } else {
        newReceipt = new Receipt([], 0);
        // throw new Error(`The receipt does not contain the minimum ${discountOnQuantity} items to activate this discount.`);
    };
    return newReceipt;
}

let productFixedDiscounts: Array<Product> = [
    { name:  ProductFixedDiscounts.BAG_OF_POTATOES, price: 5 },
    { name:  ProductFixedDiscounts.BAG_OF_CARROTS, price: 3 },
    { name:  ProductFixedDiscounts.CASE_OF_BEER, price: 12 },
    { name:  ProductFixedDiscounts.PACK_OF_TOILET_ROLLS, price: 3.5 }
];

function fixedDiscounts(receipt: Receipt): Receipt {
    let found: Product;
    receipt.items.find((receiptItem: ReceiptItem) => {
        found = productFixedDiscounts.find((product: Product) => receiptItem.product.name === product.name);
    });

    if (found)  {
        const checkout = new Checkout();
        checkout.scanItem(new Product(found.name, found.price));
        return receipt = checkout.generateReceipt();
    } else {
        return receipt;
    }
}

describe('Given a customer is shopping at the supermarket', () => {

    describe('When no items have been scanned', () => {

        let receipt: Receipt;

        beforeEach(() => {
            const checkout = new Checkout();
            receipt = checkout.generateReceipt();
        });

        it('Then the receipt should contain no scanned items', () => {
            expect(receipt.items).toHaveLength(0);
        });

        it('Then the receipt total price should be zero', () => {
            expect(receipt.totalPrice).toEqual(0);
        });

    });

    describe('When an a single "Apple" is scanned and there is no promotion/offer', () => {

        let receipt: Receipt;

        beforeEach(() => {
            const checkout = new Checkout();
            checkout.scanItem(new Product('Apple', 0.3))
            receipt = checkout.generateReceipt();
        });

        it('Then the receipt should contain 1 scanned item', () => {
            expect(receipt.items).toHaveLength(1);
        });

        it('Then the receipt should contain an "Apple" item', () => {
            expect(lookupReceiptItem(receipt, 'Apple')).toBeDefined();
        });

        it('Then the receipt "Apple" item should have the correct quantity', () => {
            expect(lookupReceiptItem(receipt, 'Apple').quantity).toEqual(1);
        });

        it('Then the receipt total price should be calculated correctly', () => {
            expect(receipt.totalPrice).toEqual(0.3);
        });

    });

    describe('Special deals', ()=> {
        let receipt: Receipt;

        beforeEach(() => {
            const checkout = new Checkout();
            checkout.scanItem(new Product('Apple', 0.3));
            checkout.scanItem(new Product('Apple', 0.3));
            receipt = checkout.generateReceipt();
        });

        it('Buy 2 get one free', () => {
            expect(promotionBuyXGetOneFree(receipt, 2).totalPrice).toEqual(0.3);
        });

        it('Buy 4 get one free', () => {
            const checkout = new Checkout();

            for (let i=0; i<4; i++) {
                checkout.scanItem(new Product('Orange', 0.6));
            };
            receipt = checkout.generateReceipt();
            expect(promotionBuyXGetOneFree(receipt, 4).totalPrice).toEqual(1.8);
        });

        it('10% discount on rice', () => {
            const checkout = new Checkout();
            checkout.scanItem(new Product('Rice', 10));
            receipt = checkout.generateReceipt();
            expect(percentageDiscount(10, receipt).totalPrice).toEqual(9);
        });

        it('20% discount on bananas if more than 10', () => {
            const checkout = new Checkout();
            for (let i=0; i<10; i++) {
                checkout.scanItem(new Product('Banana', 0.8));
            };

            receipt = checkout.generateReceipt();
            expect(percentageDiscountDependingOnQuantity(20, receipt, 10).totalPrice).toEqual(6.4);
        });

        it('20% discount on bananas if more than 10 (quantity 15)', () => {
            const checkout = new Checkout();
            for (let i=0; i<15; i++) {
                checkout.scanItem(new Product('Banana', 0.8));
            };

            receipt = checkout.generateReceipt();
            expect(percentageDiscountDependingOnQuantity(20, receipt, 10).totalPrice).toEqual(9.6);
        });

        it('No discount on bananas if less than 10', () => {
            const checkout = new Checkout();
            for (let i=0; i<7; i++) {
                checkout.scanItem(new Product('Banana', 0.8));
            };

            receipt = checkout.generateReceipt();
            expect(percentageDiscountDependingOnQuantity(20, receipt, 10).totalPrice).toEqual(0);
        });
    });

    describe('Fixed discounts', () => {

        let receipt: Receipt;

        it('bag of potatoes costs £5 instead £6', () => {
            const checkout = new Checkout();
            checkout.scanItem(new Product(ProductFixedDiscounts.BAG_OF_POTATOES, 6));
            receipt = checkout.generateReceipt();
            const newReceipt: Receipt = fixedDiscounts(receipt);
            expect(newReceipt.totalPrice).toEqual(5);
        });

        it('case of beer costs £12 instead £15', () => {
            const checkout = new Checkout();
            checkout.scanItem(new Product(ProductFixedDiscounts.CASE_OF_BEER, 15));
            receipt = checkout.generateReceipt();
            const newReceipt: Receipt = fixedDiscounts(receipt);
            expect(newReceipt.totalPrice).toEqual(12);
        });

        it('bag of coal costs the original amount £12 which is not in the discount list', () => {
            const checkout = new Checkout();
            checkout.scanItem(new Product('bag of coal', 12));
            receipt = checkout.generateReceipt();
            const newReceipt: Receipt = fixedDiscounts(receipt);
            expect(newReceipt.totalPrice).toEqual(12);
        });
    });

});