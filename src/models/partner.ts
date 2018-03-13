


export interface Partner {

    PARTNER: string;
    CLASSIFIC: {
        IS_CUSTOMER?: string;
        NIELSEN_ID?: string;
        CLASSIFIC?: string;//customer class
        IS_COD_CUSTOMER?: string;
        ATTRIBUTE?: string;
        INDUSTRY?: string;
        ATTRIB_2?: string;
        ATTRIB_3?: string;
        ATTRIB_4?: string;
        ATTRIB_10?: string;
        IS_PROSPECT?: string;
        ATTRIB_9?: string;
        IS_CONSUMER?: string;
        ATTRIB_5?: string;
        ATTRIB_6?: string;
        CUSTOMER_SINCE?: string;
        ATTRIB_7?: string;
        ATTRIB_8?: string;
        IS_COMPETITOR?: string;
        IS_RENTED?: string;
        ACCOUNT_GROUP?: string;
    };
    PARTNER_GUID: string; //
    MKT_ATTR: {//
        ALLOCVALUES?: {//
            ANZDZ?: string;
            ANZST?: string;
            ATDESCR?: string;
            ATNAME?: string;
            ATVALUE?: string;
            ATVALUEDESCR?: string;
            CHANGED_AT?: string;
            CHANGED_BY?: string;
            DATATYPE?: string;
            SINGLE_VALUE?: string;
        }[];
        PARTNER_GUID?: string;
        PROFILE_TEMPLATE_DESCR?: string;
        PROFILE_TEMPLATE_ID?: string;

    }[];
    CENTRAL_ORGAN: {
        NAME4?: string;//external name 3
        NAME3?: string;//external name 2
        INDUSTRYSECTOR?: string;
        FOUNDATIONDATE?: string;
        LIQUIDATIONDATE?: string;
        CHK_DIGIT?: string;
        LEGALFORM?: string;
        LOC_NO_2?: string;
        LOC_NO_1?: string;
        LEGALORG?: string;
        NAME2?: string;//external name 1
        NAME1?: string;//internal Name
    };
    CENTRAL: {
        COMM_TYPE?: string;
        PARTNERLANGUAGE?: string;
        TITLELETTER?: string;
        PRINT_MODE?: string;
        TITLE_KEY?: string;
        NOTRELEASED?: string;
        AUTHORIZATIONGROUP?: string;
        CENTRALARCHIVINGFLAG?: string;
        SEARCHTERM1?: string;
        SEARCHTERM2?: string;
        CONTACTALLOWANCE?: string;
        PARTNERTYPE?: string;
        CENTRALBLOCK?: string;
        PARTNEREXTERNAL?: string;
        PARTNERLANGUAGEISO?: string;
        DATAORIGINTYPE?: string;
    };
    ACT_LIST: { //Ultimas actividades
        OBJECT_ID: string;
        PROCESS_TYPE: string;
        STATE: string;
        DESCRIPTION: string;
        DATE_1: string;
        DATE_2: string;
        NAME_ORG1: string;
        NAME_ORG2: string;
        NAME_LAST: string;
        NAME_FIRST: string;
    }[]; //
    ADFAX: {//fax

        CONSNUMBER?: string;
        COUNTRY?: string;
        COUNTRYISO?: string;
        ERRORFLAG?: string;
        EXTENSION?: string;
        FAX?: string;
        FAX_GROUP?: string;
        FAX_NO?: string;
        FLG_NOUSE?: string;
        R_3_USER?: string;
        SENDER_NO?: string;
        STD_NO?: string;
        STD_RECIP?: string;
        VALID_FROM?: string;
        VALID_TO?: string;
        HOME_FLAG?: string;
    }[];
    ADSMTP: {
        EMAIL_SRCH?: string;
        STD_RECIP?: string;
        E_MAIL?: string;//Email
        ERRORFLAG?: string;
        VALID_TO?: string;
        HOME_FLAG?: string;
        CONSNUMBER?: string;
        TNEF?: string;
        VALID_FROM?: string;
        R_3_USER?: string;
        FLG_NOUSE?: string;
        STD_NO?: string;
        ENCODE?: string;
    }[];
    GEODATA: {
        LONGITUDE?: string;
        BUPA_ADDRNUM?: string;
        BUPA_ADDRGUID?: string;
        LATITUDE?: string;
    };
    TEXT: {

        STXH?: {
            MANDT?: string;
            TDOBJECT?: string;//nota
            TDNAME?: string;
            TDID?: string;//nota
            TDSPRAS?: string;//nota
            TDTITLE?: string;
            TDFRELES?: string;
            TDFUSER?: string;
            TDFDATE?: string;
            TDFTIME?: string;
            TDLRELES?: string;
            TDLUSER?: string;
            TDLDATE?: string;
            TDLTIME?: string;
            TDVERSION?: string;
            TDSTYLE?: string;
            TDFORM?: string;
            TDHYPHENAT?: string;
            TDTRANSTAT?: string;
            TDOSPRAS?: string;
            TDMACODE1?: string;
            TDMACODE2?: string;
            TDTXTLINES?: string;
            TDREF?: string;
            TDREFOBJ?: string;
            TDREFNAME?: string;
            TDREFID?: string;
            TDTEXTTYPE?: string;//nota
            TDCOMPRESS?: string;
            TDOCLASS?: string;
            LOGSYS?: string;
        };
        LINES?: {

            TDFORMAT?: string;
            TDLINE?: string;
        }[];
        FUNCTION?: string;

    }[];
    ADTEL: {

        COUNTRY?: string;
        COUNTRYISO?: string;
        STD_NO?: string;
        TELEPHONE?: string;//Numero de telefono
        EXTENSION?: string;//Extension
        TEL_NO?: string;
        CALLER_NO?: string;
        STD_RECIP?: string;
        R_3_USER?: string;
        HOME_FLAG?: string;
        CONSNUMBER?: string;
        ERRORFLAG?: string;
        FLG_NOUSE?: string;
        VALID_FROM?: string;
        VALID_TO?: string;
    }[];
    DATA_INFO: {
        PERS_NO?: string;
        CREATIONDATE?: string;
        LASTCHANGETIME?: string;
        LASTCHANGEUSER?: string;
        CREATIONTIME?: string;
        LASTCHANGEDATE?: string;
        CREATIONUSER?: string;
    };
    CENTRAL_CUSTOMER_EXT: {// Campos especificos de HIPRA , diagnos , web, 
        ZZDIAGNOS?: string;//diagnostico cliente
        ZZHIPRASOFT?: string;// web hiprasofte
        ZZDEPARTMENT?: string;
        ZZDIAGNOS_VE?: string;//Diagnostico veterinario
        ZZCREATED_BY?: string;
        ZZFUNCTION?: string;
        ZZESP06?: string;
        ZZESP07?: string;
        ZZREDCIAL?: string;
        ZZESP08?: string;
        ZZMOBILEID?: string;
        ZZWEBPWD?: string; // pwdE contraseña web
        ZZESP09?: string;
        ZZFELICITACI?: string;// -----
        ZZZONA?: string;
        ZZESP01?: string;
        ZZESP02?: string;
        ZZESP03?: string;
        ZZHIPRALINK?: string;
        ZZESP04?: string;
        ZZESP05?: string;
        ZZOBSEQUIO?: string;// - ---
        ZZCATALOGO?: string;
        BP_EEW_DUMMY?: string;//nota cliente?¿
        ZZRUTACOMERC?: string;// Ruta Comercial
        ZZEDIAGN?: string;// ediagnosE
        ZZVIC?: string;// ------
        ZZEDIAGNPLUS?: string;// ediagnosPlusE
        ZZSOLOCONTAC?: string;
        ZZESP10?: string;
        ZZWEBUSR?: string;// usuarioE usuario web
    };
    ADUSE: {
        USAGEVALIDTO?: string;
        USAGEVALIDFROM?: string;
        ADDRESSTYPE?: string;
        STANDARDADDRESSUSAGE?: string;
        VALIDTOREADFORCHANGE?: string;
    }[];
    GROUP: string;
    DATA_ADDRESS: {
        HOMECITYNO?: string;
        CHCKSTATUS?: string;
        CITY_NO?: string;
        FLOOR?: string;
        COUNTRY?: string; //pais
        VALIDFROMDATE?: string;
        PO_BOX_CIT?: string;
        HOUSE_NO2?: string;
        HOUSE_NO3?: string;
        POSTL_COD2?: string;
        STANDARDADDRESS?: string;
        POSTL_COD1?: string;//postal code
        LANGUISO?: string;
        POSTL_COD3?: string;
        ROOM_NO?: string;
        REGION?: string; //region 
        DISTRCT_NO?: string;
        PBOXCIT_NO?: string;
        POBOX_CTRY?: string;
        LOCATION?: string;
        PCODE1_EXT?: string;
        PO_CTRYISO?: string;
        STR_ABBR?: string;
        DISTRICT?: string;
        TIME_ZONE?: string;
        BUILDING?: string;
        HOME_CITY?: string;
        MOVE_DATE?: string;
        COMM_TYPE?: string;
        PCODE3_EXT?: string;
        PO_BOX?: string;
        LANGU?: string;//idioma
        STREET?: string;
        COUNTRYISO?: string;
        PO_BOX_REG?: string;
        MOVE_ADDR_GUID?: string;
        DONT_USE_P?: string;
        CITY?: string; //poblacion
        MOVE_ADDRESS?: string;
        REGIOGROUP?: string;
        TAXJURCODE?: string;
        DONT_USE_S?: string;
        STREET_NO?: string;
        C_O_NAME?: string;
        PCODE2_EXT?: string;
        PO_W_O_NO?: string;
        STR_SUPPL2?: string;//street 2
        STR_SUPPL3?: string;//street 3
        VALIDTODATE?: string;
        TRANSPZONE?: string;
        EXTADDRESSNUMBER?: string;
        HOUSE_NO?: string;
        STR_SUPPL1?: string;//street 1
    };
    RELATIONS: {
        DEFAULTRELATIONSHIP?: string;
        PARTNER1?: string;
        PARTNER2?: string;
        RELATIONSHIPCATEGORY?: string;
        RELATIONSHIPTYPE?: string;
        VALIDFROMDATE?: string;
        VALIDUNTILDATE?: string;
    }[];
    CATEGORY: string;
    SALES: {
        CURRENCY?: string;
        PRICE_GROUP?: string;
        PRICE_LIST_TYPE?: string;
        DIRECT_INVOICE?: string;
        BILLPLAN_PROC?: string;
        SPLIT_BY_COND?: string;
        ETAX_SOURCE?: string;
        ACCOUNT_ASGNGRP?: string;
        EXCHANGE_TYPE?: string;
        ETAX_HAND_TYPE?: string;
        CUSTOMER_GROUP?: string;
        PAYMENT_TERMS?: string;
        REBATE_RELEVANT?: string;
        CUST_PRIC_PROC?: string;
    };

    ADURI: {//web
        STD_NO?: string;
        URI_TYPE?: string;
        URI?: string;
        STD_RECIP?: string;
        HOME_FLAG?: string;
        CONSNUMBER?: string;
        URI_PART1?: string;
        URI_PART2?: string;
        URI_PART3?: string;
        URI_PART4?: string;
        URI_PART5?: string;
        URI_PART6?: string;
        URI_PART7?: string;
        URI_PART8?: string;
        URI_PART9?: string;
        ERRORFLAG?: string;
        FLG_NOUSE?: string;
        VALID_FROM?: string;
        VALID_TO?: string;
    }[];
    SENDING?: boolean;

}