import { Serializable } from './serializable'

export class AccountActivityMinimal extends Serializable {
    public OBJECT_ID: string; //
    public DESCRIPTION: string; //
    public OPERATION: string; //
    public STATUS: string; //
    public DATE_RANGE: string; //
    public STARTTIME: string; //
    public ENDTIME: string; //
    public DATE_FLAG: string; //

}