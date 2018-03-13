import { Serializable } from './serializable'

export class ActivityCategory extends Serializable {
    public DESCRIPTION: string; //
    public CATEGORY: string; //
    public PROCESS_TYPE: string; //

    // check the functions 
    public getText() {
        return this.DESCRIPTION;
    }
    
    public getValue() {
        return this.CATEGORY;
    }

    public getCategory() {
        return ;
    }

    public getCategory_id() {
        return this.CATEGORY;
    }
}