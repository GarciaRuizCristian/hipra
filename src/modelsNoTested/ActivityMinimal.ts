import { Serializable } from './serializable'

export class ActivityMinimal extends Serializable {
    public OBJECT_ID: string; //
    public DESCRIPTION: string; //
    public OPERATION: string; //
    public STATUS: string; //
    public DATE_RANGE: string; //
    public STARTTIME: string; //
    public ENDTIME: string; //
    public PARTNER_NAME: string; //
    public PRIVATE_FLAG: string; //
    public DATE_FLAG: string; //
    public ordr_FIELD: string; //
    public ordr_DESCRIPTION_FIELD: string; //
    public srch_FIELD: string; //
    public PROCESS_TYPE: string; //
    public CUSTOM_ID: string; //
    public C: string; //
}