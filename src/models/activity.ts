import { Serializable } from './serializable'

export class Activity extends Serializable {
    public static STATE_OPEN = 0;
    public static STATE_CLOSE = 1;
    
    public HEADER: {

        GUID?: string;
        HANDLE?: string;
        PROCESS_TYPE?: string;
        OBJECT_ID?: string;
        PREDECESSOR_PROCESS?: string;
        PREDECESSOR_OBJECT_TYPE?: string;
        PREDECESSOR_LOG_SYSTEM?: string;
        BIN_RELATION_TYPE?: string;
        LOGICAL_SYSTEM?: string;
        DESCR_LANGUAGE?: string;
        LANGU_ISO?: string;
        DESCRIPTION?: string;
        CATEGORY?: string;
        PRIORITY?: string;
        OBJECTIVE?: string;
        DIRECTION?: string;
        EXTERN_ACT_ID?: string;
        ADDRESS_ID?: string;
        ADDRESS_GUID?: string;
        PRIVATE_FLAG?: string;
        COMPLETION?: string;
        POSTING_DATE?: string;
        MODE?: string;
        CREATED_AT?: string;
        CREATED_BY?: string;
        CHANGED_AT?: string;
        CHANGED_BY?: string;
        ACT_LOCATION?: string;

    };
    public PARTNERS: {

        REF_GUID?: string;
        REF_HANDLE?: string;
        REF_KIND?: string;
        REF_PARTNER_HANDLE?: string;
        REF_PARTNER_FCT?: string;
        REF_PARTNER_NO?: string;
        REF_NO_TYPE?: string;
        REF_DISPLAY_TYPE?: string;
        PARTNER_FCT?: string;
        PARTNER_NO?: string;
        NO_TYPE?: string;
        DISPLAY_TYPE?: string;
        KIND_OF_ENTRY?: string;
        MAINPARTNER?: string;
        RELATION_PARTNER?: string;
        BUSINESSPARTNERGUID?: string;
        ADDRESS_GUID?: string;
        ADDR_NR?: string;
        ADDR_NP?: string;
        ADDR_TYPE?: string;
        ADDR_ORIGIN?: string;
        STD_BP_ADDRESS?: string;
        ADDR_OPERATION?: string;
        CALENDAR?: string;
        DISABLED?: string;
        TITLE_P?: string;
        FIRSTNAME?: string;
        LASTNAME?: string;
        BIRTH_NAME?: string;
        MIDDLENAME?: string;
        SECONDNAME?: string;
        FULLNAME?: string;
        FULLNAME_X?: string;
        TITLE_ACA1?: string;
        TITLE_ACA2?: string;
        PREFIX1?: string;
        PREFIX2?: string;
        TITLE_SPPL?: string;
        NICKNAME?: string;
        INITIALS?: string;
        NAMEFORMAT?: string;
        NAMCOUNTRY?: string;
        LANGU_P?: string;
        LANGUP_ISO?: string;
        SORT1_P?: string;
        SORT2_P?: string;
        DEPARTMENT?: string;
        FUNCTION?: string;
        BUILDING_P?: string;
        FLOOR_P?: string;
        ROOM_NO_P?: string;
        INITS_SIG?: string;
        INHOUSE_ML?: string;
        COMM_TYPE?: string;
        TITLE?: string;
        NAME?: string;
        NAME_2?: string;
        NAME_3?: string;
        NAME_4?: string;
        C_O_NAME?: string;
        CITY?: string;
        DISTRICT?: string;
        CITY_NO?: string;
        DISTRCT_NO?: string;
        CHCKSTATUS?: string;
        POSTL_COD1?: string;
        POSTL_COD2?: string;
        POSTL_COD3?: string;
        PO_BOX?: string;
        PO_BOX_CIT?: string;
        PBOXCIT_NO?: string;
        DELIV_DIS?: string;
        TRANSPZONE?: string;
        STREET?: string;
        STREET_NO?: string;
        STR_ABBR?: string;
        HOUSE_NO?: string;
        HOUSE_NO2?: string;
        STR_SUPPL1?: string;
        STR_SUPPL2?: string;
        STR_SUPPL3?: string;
        LOCATION?: string;
        BUILDING?: string;
        FLOOR?: string;
        ROOM_NO?: string;
        COUNTRY?: string;
        COUNTRYISO?: string;
        LANGU?: string;
        LANGU_ISO?: string;
        REGION?: string;
        SORT1?: string;
        SORT2?: string;
        TIME_ZONE?: string;
        TAXJURCODE?: string;
        ADR_NOTES?: string;
        TEL1_NUMBR?: string;
        TEL1_EXT?: string;
        FAX_NUMBER?: string;
        FAX_EXTENS?: string;
        E_MAIL?: string;
        BUILD_LONG?: string;

    }[];
    public DATE: {
        REF_GUID?: string;
        REF_HANDLE?: string;
        REF_KIND?: string;
        APPT_TYPE?: string;
        TIMESTAMP_FROM?: string;
        TIMEZONE_FROM?: string;
        TIMESTAMP_TO?: string;
        TIMEZONE_TO?: string;
        DATE_FROM?: string;
        DATE_TO?: string;
        TIME_FROM?: string;
        TIME_TO?: string;
        SHOW_LOCAL?: string;
        DOMINANT?: string;
        RULE_ID?: string;
        RULE_NAME?: string;
        DURATION?: string;
        TIME_UNIT?: string;
        IS_DURATION?: string;
        MODE?: string;
    }[];

    public OUTCOME: {
        REF_GUID?: string;
        REF_HANDLE?: string;
        CODE_GROUP?: string;
        CODE?: string;
        MODE?: string;

    }[];
    public REASON: {
        REF_GUID?: string;
        REF_HANDLE?: string;
        CODE_GROUP?: string;
        CODE?: string;
        MODE?: string;

    }[];
    public TEXT: {
        LANGU_ISO?: string;
        MODE?: string;
        REF_GUID?: string;
        REF_HANDLE?: string;
        REF_KIND?: string;
        TDFORM?: string;
        TDFORMAT?: string;
        TDID?: string;
        TDLINE?: string;
        TDSPRAS?: string;
        TDSTYLE?: string;

    }[];
    public STATUS_TAB: {
        REF_GUID?: string;
        REF_HANDLE?: string;
        REF_KIND?: string;
        STATUS?: string;
        USER_STAT_PROC?: string;
        ACTIVATE?: string;
        PROCESS?: string;

    }[]; //
    public MATERIAL_TAB: {

        GUID?: string;
        HANDLE?: string;
        HEADER_HANDLE?: string;
        HEADER?: string;
        PRODUCT?: string;
        ORDERED_PROD?: string;
        DESCRIPTION?: string;
        ITM_LANGUAGE?: string;
        LANGU_ISO?: string;
        NUMBER_INT?: string;
        NUMBER_EXT?: string;
        ITM_TYPE?: string;
        ORDER_DATE?: string;
        ITM_TYPE_USAGE?: string;
        GROSS_WEIGHT?: string;
        NET_WEIGHT?: string;
        WEIGHT_UNIT?: string;
        WEIGHT_UNIT_ISO?: string;
        VOLUME?: string;
        VOLUME_UNIT?: string;
        VOLUME_UNIT_ISO?: string;
        PROCESS_QTY_NUM?: string;
        PROCESS_QTY_DEN?: string;
        EXPONENT10?: string;
        PROCESS_QTY_UNIT?: string;
        PROCESS_QTY_UNIT_ISO?: string;
        PROD_PR_GROUP?: string;
        PRC_GROUP1?: string;
        PRC_GROUP2?: string;
        PRC_GROUP3?: string;
        PRC_GROUP4?: string;
        PRC_GROUP5?: string;
        PROD_HIERARCHY?: string;
        QUANTITY?: string;
        BATCH_ID?: string;
        MODE?: string;
        COND_RATE?: string;
        CURRENCY?: string;
        NET_VALUE?: string;
        NET_PRICE?: string;

    }[]; //
    public DATE_1: string; 
    public DATE_2: string; 
    public DATE_3: string; 
    public DATE_4: string; 
    public ZZICALGUID: string; 
    public DATETIME_FROM: any; 
    public DATETIME_TO: any;


}