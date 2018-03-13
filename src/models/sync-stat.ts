import { Serializable } from './serializable'

export class SyncStat extends Serializable {
    public cache: string; 
    public hash: string; 
    public lang: string; 
    public updated: string;
}