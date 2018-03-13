
export interface WebAdapterRequestConfig{
    adapterMethod: string;
    responseBodyName: string;
    itemListFieldName: string; 
    maxFieldName?: string;
    totalFieldName?: string;
    preInsert?: (item) => void;
}
