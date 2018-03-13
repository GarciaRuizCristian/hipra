import { Serializable } from './serializable'

export class Country extends Serializable {
    public LANDX50: string; //
    public SPRAS: string; //
    public NATIO: string; //
    public LAND1: string; //value
    public MANDT: string; //
    public LANDX: string; //text
    public NATIO50: string; //

    public getText() {//
        return this.LANDX;
    }
    
    public getValue() {
        return this.LAND1;
    }
}