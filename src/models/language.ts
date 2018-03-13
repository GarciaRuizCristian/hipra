import { Serializable } from './serializable'

export class Language extends Serializable {
    public SPTXT: string; //text
    public SPRSL: string; //value

    public getText() {
        return this.SPTXT;
    }
    
    public getValue() {
        return this.SPRSL;
    }
}