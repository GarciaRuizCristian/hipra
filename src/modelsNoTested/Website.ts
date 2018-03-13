import { Serializable } from './serializable'

export class Website extends Serializable {
    public website: string; //text
    public accountPARTNER: string; //

    public getText() {
        return this.website;
    }
    
}