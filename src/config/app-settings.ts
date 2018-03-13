import { Activity } from '../models/activity';
import { ActivityAbstract } from '../models/activityAbstract';
import { ActivityAbstractWeb } from '../models/activityAbstractWeb';
import { Partner } from '../models/partner';
import { PartnerAbstract } from '../models/partnerAbstract';
import { PartnerAbstractWeb } from '../models/partnerAbstractWeb';
import { Product } from '../models/product';
import { ProductAbstract } from '../models/productAbstract';
import { Order } from '../models/order';
import { OrderAbstract } from '../models/orderAbstract';
import { OrderAbstractWeb } from '../models/orderAbstractWeb';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { StoreConfig } from '../models/store-config';
import { WebAdapterRequestConfig } from '../models/web-adapter-request-config';

export class AppSettings {
  public static APP_NAME = 'SAP CRM';
  public static SECURITY_TOKEN = 'U0lQX1NBUDpTQVBfU0lQ';
  public static DEFAULT_LANGUAGE = 'S';

  public static GOOGLE_ANALYTICS_ID = 'UA-TODOXXX-1'

  public static DATABASE_OLD_NAMES = ["crm.db","crm2.db",'crm3.db, crm4.db','crm5.db'];
  public static DATABASE_NAME = 'crm6.db';

  public static ACTIVITY_OPEN_STATUSES = ["E0001", "E0002"];
  public static ACTIVITY_CLOSED_STATUSES = ["E0003", "E0007"];

  public static ACTIVITY_EVENT_OPEN_STATUSES = ["E0001", "E0003", "E0017"];
  public static ACTIVITY_EVENT_CLOSED_STATUSES = ["E0016", "E0018", "E0019"];


  public static SIGNATURE_NOTE_TYPE = "Z005";
  public static SIGNATURE_TIME_TRACE = 1496129489749;

  //ORDENES
  /** Hemos detectado los siguientes estados. Al crear una orden con estado E0001 nos devuelve
   *  dos estados: Do Not print y Open 
   * 
   *  E0001 - Do not print 
   *  E0002 - Open
   *  E0003 - In process
   *  E0004 - Completed **/
  public static ORDER_STATUSES_OPEN = ["E0001", "E0002"];
  public static ORDER_STATUSES_PROCESSING = ["E0003"];
  public static ORDER_STATUSES_CLOSED = ["E0004"];

  public static ORDER_TYPE_OPPORTUNITY = "Z007";
  public static ORDER_TYPE_OPPORTUNITY_WEB = "OP";
  public static ORDER_TYPE_SALES = "Z014";
  public static ORDER_TYPE_SALES_WEB = "OR";

  public static MIN_SYNC_DATE = "20000101"; //"20160101" "20000101"
  public static REQUIRE_LOGIN_BROWSER = true;
  public static REQUIRE_LOGIN_IOS = true;

  public static MAX_ACTIVITY_TIME_4_SEARCH = 1000 * 60 * 60 * 24 * 31;

  public static MAX_CONTACTS_LOADED = 1152; // 1152 144
  public static MAX_ORDERS_LOADED = 1152; // 1152 144

  //PARSERS ABSTRACT
  public static ORDER_ABSTRACT_PARSE : Function = function (order: Order): OrderAbstract {
    //ESTADO DE LA ORDEN
    let state = -1; //Error
    if (order.STATUS_TAB) {
      for (let status of order.STATUS_TAB) {
        if (status.USER_STAT_PROC == 'CRMORDER') {
          if (AppSettings.ORDER_STATUSES_OPEN.indexOf(status.STATUS) != -1) {
            state = Order.STATE_OPEN;
          } else if (AppSettings.ORDER_STATUSES_CLOSED.indexOf(status.STATUS) != -1) {
            state = Order.STATE_CLOSE;
          } else if (AppSettings.ORDER_STATUSES_PROCESSING.indexOf(status.STATUS) != -1) {
            state = Order.STATE_PROCESSING;
          } 
          break;
        }
      }
    }

    return {
      ID: order.HEADER.OBJECT_ID,
      PROCESS_TYPE: order.HEADER.PROCESS_TYPE,
      DESCRIPTION: order.HEADER.DESCRIPTION,
      CREATED_BY: order.HEADER.CREATED_BY,
      PARTNERS: order.PARTNERS,
      DATETIME_TO: order.DATETIME_TO,
      OPERATION: order.HEADER.PROCESS_TYPE,
      STATUS_TAB: order.STATUS_TAB,
      STATE: state
    }
  };

  public static ORDER_ABSTRACT_WEB_PARSE : Function = function (order: Order): OrderAbstractWeb {
    //ESTADO DE LA ORDEN
    let state = -1; //Error
    if (order.STATUS_TAB) {
      for (let status of order.STATUS_TAB) {
        if (status.USER_STAT_PROC == 'CRMORDER') {
          if (AppSettings.ORDER_STATUSES_OPEN.indexOf(status.STATUS) != -1) {
            state = Order.STATE_OPEN;
          } else if (AppSettings.ORDER_STATUSES_CLOSED.indexOf(status.STATUS) != -1) {
            state = Order.STATE_CLOSE;
          } else if (AppSettings.ORDER_STATUSES_PROCESSING.indexOf(status.STATUS) != -1) {
            state = Order.STATE_PROCESSING;
          } 
          break;
        }
      }
    }

    AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ORDERS_LIST.preInsert(order);

    return {
      ID: order.HEADER.OBJECT_ID,
      GUID: order.HEADER.GUID,
      PROCESS_TYPE: order.HEADER.PROCESS_TYPE,
      DESCRIPTION: order.HEADER.DESCRIPTION,
      CREATED_BY: order.HEADER.CREATED_BY,
      PARTNERS: order.PARTNERS,
      DATETIME_TO: order.DATETIME_TO,
      OPERATION: order.HEADER.PROCESS_TYPE,
      STATUS_TAB: order.STATUS_TAB,
      STATE: state
    }
  };

  public static getOrderState: Function = function (activity: Activity): number {
    let state = -1;

   if (activity.STATUS_TAB) {
      for (let status of activity.STATUS_TAB) {
        if (status.USER_STAT_PROC != '') {
          if (AppSettings.ORDER_STATUSES_OPEN.indexOf(status.STATUS) != -1) {
            state = Order.STATE_OPEN;
          } else if (AppSettings.ORDER_STATUSES_CLOSED.indexOf(status.STATUS) != -1) {
            state = Order.STATE_CLOSE;
          } else if (AppSettings.ORDER_STATUSES_PROCESSING.indexOf(status.STATUS) != -1) {
            state = Order.STATE_PROCESSING;
          } 
          break;
        }
      }
    }
      return state;
  }
   

  public static PARTNER_ABSTRACT_PARSE : Function = function (partner: Partner): PartnerAbstract {
    let partnerAbstract = {
      PARTNER: partner.PARTNER,
      NAME: partner.CENTRAL_ORGAN.NAME1,
      ADDRESS: partner.DATA_ADDRESS.STR_SUPPL1,
      PHONE: partner.ADTEL,
      GROUP: partner.GROUP,
      LATITUDE: partner.GEODATA.LATITUDE,
      LONGITUDE: partner.GEODATA.LONGITUDE,
      CLASSIFIC: partner.CLASSIFIC.CLASSIFIC,
      RELATIONS: partner.RELATIONS
    }

    if (partner.SENDING)
      partnerAbstract["SENDING"] = true;

  return partnerAbstract;
  };

  public static PARTNER_ABSTRACT_WEB_PARSE : Function = function (partner: Partner): PartnerAbstractWeb {
    let partnerAbstractWeb = {
      PARTNER: partner.PARTNER,
      PARTNER_GUID: partner.PARTNER_GUID,
      NAME: partner.CENTRAL_ORGAN.NAME1,
      ADDRESS: partner.DATA_ADDRESS.STR_SUPPL1,
      PHONE: partner.ADTEL,
      GROUP: partner.GROUP,
      LATITUDE: partner.GEODATA.LATITUDE,
      LONGITUDE: partner.GEODATA.LONGITUDE,
      CLASSIFIC: partner.CLASSIFIC.CLASSIFIC,
      RELATIONS: partner.RELATIONS
    }

    if (partner.SENDING)
      partnerAbstractWeb["SENDING"] = true;

    return partnerAbstractWeb;
  };

  public static EMPLOYEE_RESPONSIBLE_ABSTRACT_PARSE : Function = (activity: Activity): String => {
    let fullname = "";

    if (activity.PARTNERS) {
      for (let partner of activity.PARTNERS) {
        if (partner.PARTNER_FCT == "00000014") {
          if (fullname == "") 
            fullname = partner.FULLNAME;
          else
            fullname = fullname + "," + partner.FULLNAME;
        }
      }
    }

    return fullname;
  };

  public static REQUESTOR_ABSTRACT_PARSE : Function = (activity: Activity): String => {
    let fullname = "";

    if (activity.PARTNERS) {
      for (let partner of activity.PARTNERS) {
        if (partner.PARTNER_FCT == "00000001") {
          fullname = partner.FULLNAME;
        }
      }
    }

    return fullname;
  };

  public static ACTIVITY_ABSTRACT_PARSE : Function = function (activity: Activity): ActivityAbstract {
    let state = -1;

    if (activity.STATUS_TAB) {
      for (let status of activity.STATUS_TAB) {
        if (status.USER_STAT_PROC == 'CRMACTIV' || status.USER_STAT_PROC == 'CRMORDER') {
          if (AppSettings.ACTIVITY_OPEN_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_OPEN; //ACTIVIDADES ABIERTAS normales
          } else if (AppSettings.ACTIVITY_CLOSED_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_CLOSE; //ACTIVIDADES CERRADAS normales
          }
        } else if (status.USER_STAT_PROC == 'ZEVENTO2') {
          if (AppSettings.ACTIVITY_EVENT_OPEN_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_OPEN; //ACTIVIDADES ABIERTAS de evento
          } else if (AppSettings.ACTIVITY_EVENT_CLOSED_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_CLOSE; //ACTIVIDADES CERRADAS de evento
          }
        }
      }
    }
    
    return {
      ACTIVITY_ID: activity.HEADER.OBJECT_ID,
      DESCRIPTION: activity.HEADER.DESCRIPTION,
      CREATED_BY: activity.HEADER.CREATED_BY,
      PARTNERS: activity.PARTNERS,
      OPERATION: activity.HEADER.PROCESS_TYPE,
      DATETIME_TO: activity.DATETIME_TO,
      DATETIME_FROM: activity.DATETIME_FROM,
      STATUS_TAB: activity.STATUS_TAB,
      STATE: state
    }
  };

  public static ACTIVITY_ABSTRACT_WEB_PARSE : Function = function (activity: Activity): ActivityAbstractWeb {
    let state = -1;
    
    if (activity.STATUS_TAB) {
      for (let status of activity.STATUS_TAB) {
        if (status.USER_STAT_PROC == 'CRMACTIV' || status.USER_STAT_PROC == 'CRMORDER') {
          if (AppSettings.ACTIVITY_OPEN_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_OPEN; //ACTIVIDADES ABIERTAS normales
          } else if (AppSettings.ACTIVITY_CLOSED_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_CLOSE; //ACTIVIDADES CERRADAS normales
          }
        } else if (status.USER_STAT_PROC == 'ZEVENTO2') {
          if (AppSettings.ACTIVITY_EVENT_OPEN_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_OPEN; //ACTIVIDADES ABIERTAS de evento
          } else if (AppSettings.ACTIVITY_EVENT_CLOSED_STATUSES.indexOf(status.STATUS) != -1) {
            state = Activity.STATE_CLOSE; //ACTIVIDADES CERRADAS de evento
          }
        }
      }
    }

    AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ACTIVITIES_LIST.preInsert(activity);
    
    return {
      ACTIVITY_ID: activity.HEADER.OBJECT_ID,
      ACTIVITY_GUID: activity.HEADER.GUID,
      DESCRIPTION: activity.HEADER.DESCRIPTION,
      CREATED_BY: activity.HEADER.CREATED_BY,
      PARTNERS: activity.PARTNERS,
      OPERATION: activity.HEADER.PROCESS_TYPE,
      DATETIME_TO: activity.DATETIME_TO,
      DATETIME_FROM: activity.DATETIME_FROM,
      STATUS_TAB: activity.STATUS_TAB,
      STATE: state
    }
  };

  public static PRODUCT_ABSTRACT_PARSE : Function =  function (product: Product): ProductAbstract {
    return {
      IDMATERIAL: product.IDMATERIAL,
      MATERIAL: product.MATERIAL
    }
  };

  //WEB ADAPTER REQUEST CONFIG
  public static WEB_ADAPTER_REQUEST_CONFIG_LOGIN: WebAdapterRequestConfig = {
    adapterMethod: "login",
    responseBodyName: "ZIPAD_LOGIN",
    itemListFieldName: "O_PARTNER"
  };

  public static WEB_ADAPTER_REQUEST_CONFIG_PARTNER: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedPartner",
    responseBodyName: "ZIPADWL_READPARTNER",
    itemListFieldName: "O_PARTNER"
  };

  public static WEB_ADAPTER_REQUEST_CONFIG_PARTNERS_LIST: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedPartnersList",
    responseBodyName: "ZIPADWL_GETPARTNERS_LIST",
    itemListFieldName: "T_PARTNER",
    maxFieldName: "O_MAXPARTNERS"
  };

  public static WEB_ADAPTER_REQUEST_CONFIG_ACTIVITY: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedActivity",
    responseBodyName: "ZIPADWL_GETACTIVIDAD",
    itemListFieldName: "HEADER+DATE+MATERIAL_TAB+OUTCOME+PARTNERS+REASON+STATUS_TAB+TEXT"
  }

  public static WEB_ADAPTER_REQUEST_CONFIG_ACTIVITIES_LIST: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedActivitiesList",
    responseBodyName: "ZIPADWL_GETACTIVIDADES_LIST",
    itemListFieldName: "T_ACTIVITY",
    maxFieldName: "O_MAXACTIVITIES",
    totalFieldName: "O_TOTALACTIVITIES",
    preInsert: function (activity: Activity) {
      for (let fecha of activity.DATE) {
        if (fecha.APPT_TYPE == 'ORDERPLANNED' || fecha.APPT_TYPE == 'ORDERACTUAL') {//TODO

          let fromDateFrom = [];
          let fromDateTo = [];
          let fromDateTimeFrom = [];
          let fromDateTimeTo = [];

          fromDateFrom = fecha.DATE_FROM.split('-');
          fromDateTo = fecha.DATE_TO.split('-');

          fromDateTimeFrom = fecha.TIME_FROM.split(':');
          fromDateTimeTo = fecha.TIME_TO.split(':');

          let DateFrom = new Date();
          let DateTo = new Date();

          //DATE_FROM
          DateFrom.setFullYear(fromDateFrom[0]);
          DateFrom.setMonth(fromDateFrom[1] - 1);
          DateFrom.setDate(fromDateFrom[2]);


          DateFrom.setHours(fromDateTimeFrom[0]);
          DateFrom.setMinutes(fromDateTimeFrom[1]);
          DateFrom.setSeconds(fromDateTimeFrom[2]);

          //DATE_TO
          DateTo.setFullYear(fromDateTo[0]);
          DateTo.setMonth(fromDateTo[1] - 1);
          DateTo.setDate(fromDateTo[2]);

          DateTo.setHours(fromDateTimeTo[0]);
          DateTo.setMinutes(fromDateTimeTo[1]);
          DateTo.setSeconds(fromDateTimeTo[2]);

          activity.DATETIME_FROM = DateFrom.getTime();
          activity.DATETIME_TO = DateTo.getTime();

        }
      }
    }
  };

  public static WEB_ADAPTER_REQUEST_CONFIG_ORDER: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedActivity",
    responseBodyName: "ZIPADWL_GETACTIVIDAD",
    itemListFieldName: "HEADER+DATE+MATERIAL_TAB+OUTCOME+PARTNERS+REASON+STATUS_TAB+TEXT"
  }

  public static WEB_ADAPTER_REQUEST_CONFIG_ORDERS_LIST: WebAdapterRequestConfig = {
    adapterMethod: "getOptimizedOrdersList",
    responseBodyName: "ZIPADWL_GETORDERS_LIST",
    itemListFieldName: "T_ACTIVITY",
    maxFieldName: "O_MAXACTIVITIES",
    preInsert: function (order: Order) {
      for (let fecha of order.DATE) {
        if (fecha.APPT_TYPE == 'ORDERPLANNED' || fecha.APPT_TYPE == 'ORDERACTUAL') {//TODO

          let fromDateTo = [];
          let fromDateTimeTo = [];

          fromDateTo = fecha.DATE_TO.split('-');
          fromDateTimeTo = fecha.TIME_TO.split(':');

          let DateTo = new Date();

          //DATE_TO
          DateTo.setFullYear(fromDateTo[0]);
          DateTo.setMonth(fromDateTo[1] - 1);
          DateTo.setDate(fromDateTo[2]);

          DateTo.setHours(fromDateTimeTo[0]);
          DateTo.setMinutes(fromDateTimeTo[1]);
          DateTo.setSeconds(fromDateTimeTo[2]);

          order.DATETIME_TO = DateTo.getTime();
        }
      }
    }
  }; 

  //STORE CONFIG
  public static STORE_CONFIG_PARTNERS: StoreConfig = {
    name: "partners",
    adapterMethod: "getPartners",
    daily: false,
    pageSize: 100,   
    responseBodyName: "ZIPADWL_GETPARTNERS",
    itemListFieldName: "T_PARTNER",
    maxFieldName: "O_MAXPARTNERS",
    primaryKey: (item: Partner) => item.PARTNER,
    indexColumns: [
      { name: "NAME",  valueOf: (item: Partner) => item.CENTRAL_ORGAN.NAME1.toUpperCase(), dbType: "TEXT", unique: false },
      { name: "USER", valueOf: (item) => item.CENTRAL_CUSTOMER_EXT.ZZWEBUSR, dbType:"TEXT", unique: false},
      { name: "GRP",  valueOf: (item) => item.GROUP, dbType: "TEXT", unique: false },
      { name: "ADDRESS",  valueOf: (item: Partner) => item.DATA_ADDRESS.STR_SUPPL1.toUpperCase(), dbType: "TEXT", unique: false }
      //{ name: "GUID", path: "HEADER.PARTNER_GUID", options: { unique: true } }
    ],
    isDeleted: function (partner: Partner) {
      return partner.CENTRAL.CENTRALARCHIVINGFLAG == "X" ? true : false;
    }
  };

  public static STORE_CONFIG_PRODUCTS: StoreConfig = {
    name: "products",
    adapterMethod: "getProducts",
    daily: true,
    pageSize: 150,
    responseBodyName: "ZIPADWL_GETPRODUCTS",
    itemListFieldName: "O_PRODUCTS",
    maxFieldName: "O_MAXPRODUCTS",
    primaryKey: (item: Product) => item.IDMATERIAL,
    indexColumns: [
      { name: "TIPO_MATERIAL",  valueOf: (item) => item.IDTIPOMATERIAL, dbType:"TEXT", unique: false },
      { name: "MATERIAL",  valueOf: (item) => item.MATERIAL, dbType:"TEXT", unique: false },
      { name: "ATTRIBUTE",  valueOf: (item) => item.ATTRIBUTE, dbType:"TEXT", unique: false },
    ]
  };

  public static STORE_CONFIG_ACTIVITIES: StoreConfig = {
    name: "activities",
    adapterMethod: "getActivities",
    daily: false,
    pageSize: 150,
    responseBodyName: "ZIPADWL_GETACTIVIDADES",
    itemListFieldName: "T_ACTIVITY",
    maxFieldName: "O_MAXACTIVITIES",
    primaryKey: (item: Activity) => item.HEADER.OBJECT_ID,
    indexColumns: [
      { name: "DATETIME_FROM", valueOf: (item) => item.DATETIME_FROM, dbType:"TEXT", unique: false },
      { name: "DATETIME_TO", valueOf: (item) => item.DATETIME_TO, dbType:"TEXT", unique: false },   
      { name: "PROCESS_TYPE", valueOf: (item) => item.HEADER.PROCESS_TYPE, dbType:"TEXT" , unique: false },
      { name: "STATUS", valueOf: (item) => AppSettings.ACTIVITY_ABSTRACT_PARSE(item).STATE, dbType:"SMALLINT" , unique: false },
      { name: "ORDER_STATE", valueOf: (item) => AppSettings.getOrderState(item), dbType:"SMALLINT" , unique: false },
      { name: "ORDER_DESCRIPTION", valueOf: (item) => item.HEADER.DESCRIPTION, dbType:"SMALLINT" , unique: false },
      { name: "EMPLOYEE_RESPONSIBLE_FULLNAME", valueOf: (item) => AppSettings.EMPLOYEE_RESPONSIBLE_ABSTRACT_PARSE(item), dbType:"TEXT" , unique: false },
      { name: "REQUESTOR_FULLNAME", valueOf: (item) => AppSettings.REQUESTOR_ABSTRACT_PARSE(item), dbType:"TEXT" , unique: false }
    ],
    isDeleted: function (activity: Activity) {
      return activity.HEADER.PRIVATE_FLAG == "D" ? true : false;
    },
    preInsert: function (activity: Activity) {
      for (let fecha of activity.DATE) {
        if (fecha.APPT_TYPE == 'ORDERPLANNED' || fecha.APPT_TYPE == 'ORDERACTUAL') {//TODO

          let fromDateFrom = [];
          let fromDateTo = [];
          let fromDateTimeFrom = [];
          let fromDateTimeTo = [];

          fromDateFrom = fecha.DATE_FROM.split('-');
          fromDateTo = fecha.DATE_TO.split('-');

          fromDateTimeFrom = fecha.TIME_FROM.split(':');
          fromDateTimeTo = fecha.TIME_TO.split(':');

          let DateFrom = new Date();
          let DateTo = new Date();

          //DATE_FROM
          DateFrom.setFullYear(fromDateFrom[0]);
          DateFrom.setMonth(fromDateFrom[1] - 1);
          DateFrom.setDate(fromDateFrom[2]);


          DateFrom.setHours(fromDateTimeFrom[0]);
          DateFrom.setMinutes(fromDateTimeFrom[1]);
          DateFrom.setSeconds(fromDateTimeFrom[2]);

          //DATE_TO
          DateTo.setFullYear(fromDateTo[0]);
          DateTo.setMonth(fromDateTo[1] - 1);
          DateTo.setDate(fromDateTo[2]);

          DateTo.setHours(fromDateTimeTo[0]);
          DateTo.setMinutes(fromDateTimeTo[1]);
          DateTo.setSeconds(fromDateTimeTo[2]);

          activity.DATETIME_FROM = DateFrom.getTime();
          activity.DATETIME_TO = DateTo.getTime();

        }
      }
    }
  };

  public static STORES = [AppSettings.STORE_CONFIG_PARTNERS, AppSettings.STORE_CONFIG_ACTIVITIES, AppSettings.STORE_CONFIG_PRODUCTS];

  constructor(public http: Http) {
  }

  public getType(value): any{
      
      switch(typeof value){
        case "boolean":
        case "number": return "INTEGER";
        case "string": return "TEXT";
      }  
  }

}
