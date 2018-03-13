import { Serializable } from './serializable'

export class Functions extends Serializable {
    public BEZ30: string; //text
    public PAFKT: string; //value

    public getText() {
        return this.BEZ30;
    }

    public getValue() {
        return this.PAFKT;
    }

    public getOrder() {
        return this.PAFKT.length == 0 ? '1' : '10000';;
    }
}