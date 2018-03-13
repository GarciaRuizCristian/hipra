import { Serializable } from './serializable'

export class Title extends Serializable {
    public TITLE_NAME: string; //text
    public TITLE_KEY: string; //value

    public getText() {
        return this.TITLE_NAME;
    }
    
    public getValue() {
        return this.TITLE_KEY;
    }
}