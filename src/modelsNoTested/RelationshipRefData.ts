import { Serializable } from './serializable'

export class RelationshipRefData extends Serializable {
    public XRF: string; //
    public BEZ50: string; //text
    public BEZ50_2: string; //
    public RELTYP: string; //value
    public RTITL: string; //

    public getText() {
        return this.BEZ50;
    }
    
    public getValue() {
        return this.RELTYP;
    }
}