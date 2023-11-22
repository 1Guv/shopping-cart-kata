export class Product {

    public readonly name: string;
    public readonly price: number;

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }
}

export enum ProductFixedDiscounts {
    BAG_OF_POTATOES = 'bag of potatoes',
    BAG_OF_CARROTS = 'bag of carrots',
    CASE_OF_BEER = 'case of beer',
    PACK_OF_TOILET_ROLLS = 'pack of toilet rolls',
}

