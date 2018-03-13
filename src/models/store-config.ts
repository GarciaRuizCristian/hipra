

export interface StoreConfig{
     name: string;
     daily: boolean;
     adapterMethod: string; 
     pageSize: number; 
     responseBodyName: string;
     itemListFieldName: string; 
     maxFieldName: string; 
     indexColumns: [{
         name: string,
         valueOf: (item) => any,
         dbType: string,
         unique: boolean
     }]; 
     primaryKey: (item) => string;    
     parseAbstract?: (item) => any;
     preInsert?: (item) => void;
     isDeleted?: (item) => void;
}
