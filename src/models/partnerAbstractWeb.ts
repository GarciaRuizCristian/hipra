

export interface PartnerAbstractWeb{
    PARTNER: string;
    PARTNER_GUID: string;
    NAME: string; 
    ADDRESS: string;
    PHONE: Array<any>;
    GROUP: string;
    LATITUDE: string;
    LONGITUDE: string;
    CLASSIFIC: string;
    RELATIONS: {
       DEFAULTRELATIONSHIP?: string;
       PARTNER1?: string;
       PARTNER2?: string;
       RELATIONSHIPCATEGORY?: string;
       RELATIONSHIPTYPE?: string;
       VALIDFROMDATE?: string;
       VALIDUNTILDATE?: string;
   }[];
   SENDING?: boolean;
}