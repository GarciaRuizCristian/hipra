

export interface OrderAbstract{
     ID: string; 
     PROCESS_TYPE: string;
     DESCRIPTION: string; 
     CREATED_BY: string;
     PARTNERS: {
        PARTNER_FCT?: string;
        PARTNER_NO?: string;
        FULLNAME?: string;
    }[];
     DATETIME_TO: any;
     OPERATION: string;
     STATUS_TAB: {
        REF_GUID?: string;
        REF_HANDLE?: string;
        REF_KIND?: string;
        STATUS?: string;
        USER_STAT_PROC?: string;
        ACTIVATE?: string;
        PROCESS?: string;
    }[];
     STATE: number;
}