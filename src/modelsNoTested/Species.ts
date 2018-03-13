import { Serializable } from './serializable'

export class Species extends Serializable {
    public SPECIES_NAME: string; //text
    public SPECIES_CODE: string; // 

    public getText() {
        return this.SPECIES_NAME;
    }

    
}