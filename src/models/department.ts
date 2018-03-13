import { Serializable } from './serializable'

export class Department extends Serializable {
    public ABTNR: string; //value
    public BEZ20: string; //text 
    public CLIENT: string; //
    public SPRAS: string; //

    public getText() {
        return this.BEZ20;
    }

    public getValue() {
        return this.ABTNR;
    }
}