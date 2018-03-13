import { Serializable } from './serializable'

export class PriceType extends Serializable {
    public PRICE_LIST: string; //value
    public DESCRIPTION: string; //text
    public CLIENT: string; //
    public LANGU: string; //

    public getText() {
        return this.DESCRIPTION;
    }
    
    public getValue() {
        return this.PRICE_LIST;
    }
}