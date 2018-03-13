import { Serializable } from './serializable'

export class PriceList extends Serializable {
    public PLTYP: string; //
    public VTWEG: string; //
    public MATNR: string; //text
    public KPEIN: string; //
    public KMEIN: string; //
    public KBETR: string; //value
    public KONWA: string; //

    public getText() {
        return this.MATNR;
    }
    
    public getValue() {
        return this.KBETR;
    }
}