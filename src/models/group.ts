import { Serializable } from './serializable'

export class Group extends Serializable {
    public BU_GROUP: string; //
    public TXT15: string; // 
    public TXT40: string; //text

    public getText() {
        return this.TXT40;
    }

}