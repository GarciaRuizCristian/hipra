import { Serializable } from './serializable'

export class ActivityObjective extends Serializable {
    public CLIENT: string; //
    public DESCRIPTION: string; //objective
    public LANGU: string; //
    public OBJECTIVE: string; //objective_id


    // check the functions 

    public getText() {
        return ;
    }

    public getValue() {
        return ;
    }

    public getObjective() {
        return this.DESCRIPTION;
    }

    public getObjective_id() {
        return this.OBJECTIVE;
    }


}