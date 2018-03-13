import { Serializable } from './serializable'

export class ActivityStatus extends Serializable {
    public GUID: string; //
    public LINEP: string; //
    public LONGTEXT_EXISTS: string; //
    public OBJECT_TYPE: string; //
    public PROCESS_TYPE: string; //
    public SORTFIELD: string; //
    public STATP: string; //
    public STATUS: string; //status_id
    public TXT04: string; //
    public TXT30: string; //status
    public USER_STAT_PROC: string; //

    // check the functions 
    public getStatus() {
        return this.TXT30;
    }

    public getStatus_id() {
        return this.STATUS;
    }

    public getText() {
        return ;
    }

    public getValue() {
        return ;
    }
}