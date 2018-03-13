import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { StoreConfig } from '../models/store-config';
import { AppSettings } from '../config/app-settings';

declare var window: any;
@Injectable()
export class DBProvider {
    public db: any; 

    constructor(public platform: Platform) {
         
    }

    public createDB(name:any, tables: any): Promise<any> {
        console.log("Creating BBDD");     
        if (window.cordova.platformId!=="browser") {
            let openparms = {
                name: name,
                location: 2, // local backup
                createFromLocation: 0
            };
            this.db = window.sqlitePlugin.openDatabase(openparms);
        } else {
            console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');
            this.db = window.openDatabase(name, '1.0', 'database', 5 * 1024 * 1024);
        }
        
        return this.createTables(tables);
    }

    createTables(stores: StoreConfig[]): Promise<any> {
        let proms = [];
        var columns: String = "";              
        for (let i = 0; i < stores.length; i++) {
            columns = "ID CHAR(20) PRIMARY KEY, OBJECT TEXT";                       
            var x;            
            for(x=0; x<stores[i].indexColumns.length; x++){              
                columns +=", "+ stores[i].indexColumns[x].name+" "+stores[i].indexColumns[x].dbType; 
            }     
            let sql = 'CREATE TABLE IF NOT EXISTS '+stores[i].name+'('+columns+')';
            //TODO usar indexColumnsQuery()
            proms.push(this.query(sql, []));
        }      

        console.log("DataBase created");
        return Promise.all(proms);
    }  
  
    query(query: string, params = []): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.db.transaction((tx) => {
                    tx.executeSql(query, params,
                        (tx, res) => resolve({ tx: tx, res: res }),
                        (tx, err) => reject({ tx: tx, err: err }));
                    },
                    (err) => reject({ err: err }));
            } catch (err) {
                reject({ err: err });
            }
        });
    }

    getDB(): Promise<any>{
        return Promise.resolve(this.db);
    }

    clearDatabase(): Promise<any>{
         return this.getDB().then((db) => {
          console.log("Clearing database");                
          for (let i = 0; i < AppSettings.STORES.length; i++) {                   
            let sql = 'DROP TABLE '+AppSettings.STORES[i].name;
            this.query(sql, []);
          }       
        
        console.log("Database cleared");       
        });        
    }

    public indexColumnsQuery(store: StoreConfig) {
      //TODO forma el string con store.indexColumns y los columnNames...si hace fatla modificar esto para que tenga mas datos ocmo el tipo de columna
      //asi se hacia con indexdb store.createIndex(AppSettings.STORES[i].indexColumns[j].name, AppSettings.STORES[i].indexColumns[j].path, AppSettings.STORES[i].indexColumns[j].options);
    }
}