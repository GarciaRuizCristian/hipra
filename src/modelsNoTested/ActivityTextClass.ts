import { Serializable } from './serializable'

export class ActivityTextClass extends Serializable {
    public TDID: string; //value
    public PROCESS_TYPE: string; //
    public TDTEXT: string; //text
    public TDOBJECT: string; //

    public getText() {
        return this.TDTEXT;
    }
    
    public getValue() {
        return this.TDID;
    }
}