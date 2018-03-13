import { Serializable } from './serializable'

export class Region extends Serializable {
    public BEZEI: string; //text
    public BLAND: string; //value
    public LAND1: string; //
    public LANDT: string; //
    public MANDT: string; //


    public getText() {//
        return this.BEZEI;
    }
    
    public getValue() {
        return this.BLAND;
    }
}