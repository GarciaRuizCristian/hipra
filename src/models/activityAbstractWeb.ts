

export interface ActivityAbstractWeb{
    ACTIVITY_ID: string;
    ACTIVITY_GUID: string;
    DESCRIPTION: string;
    CREATED_BY: string;
    PARTNERS: {
        PARTNER_FCT?: string;
        PARTNER_NO?: string;
        FULLNAME?: string;
    }[];
    OPERATION: string;
    DATETIME_TO: any;
    DATETIME_FROM: any;
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