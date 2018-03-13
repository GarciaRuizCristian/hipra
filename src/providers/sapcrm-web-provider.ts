import { Injectable } from "@angular/core";
import { AppSettings } from '../config/app-settings';
import { WebAdapterRequestConfig } from '../models/web-adapter-request-config';
import { Partner } from '../models/partner';
import { PartnerAbstractWeb } from "../models/partnerAbstractWeb";
import { PartnersWeb } from '../models/partnersWeb';
import { Activity } from '../models/activity';
import { ActivityAbstractWeb } from "../models/activityAbstractWeb";
import { ActivitiesWeb } from '../models/activitiesWeb';
import { Order } from '../models/order';
import { OrderAbstractWeb } from "../models/orderAbstractWeb";
import { OrdersWeb } from '../models/ordersWeb';
import { LoginProvider } from '../providers/login-provider';
import { UtilsProvider } from '../providers/utils-provider';


@Injectable()
export class SapcrmWebProvider {

    constructor(
        private loginProvider: LoginProvider,
        private utils: UtilsProvider) {

    }








    

    //Funcion que llama al metodo login() del adaptador 'sapcrmWeb' para recuperar el identificador del contacto logueado
    public login(webAdapterRequestConfig: WebAdapterRequestConfig) {

        return new Promise<string>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, this.loginProvider.user.id, this.loginProvider.user.password];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(data.O_PARTNER);
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedPartner() del adaptador 'sapcrmWeb' para recuperar el contacto abstracto
    private getOptimizedPartnerAbstractWeb(webAdapterRequestConfig: WebAdapterRequestConfig, act_list: string, crmv3: string, id: string, partnerguid: string) {

        return new Promise<PartnerAbstractWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, act_list, crmv3, this.loginProvider.user.lang, id, partnerguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataPartnerAbstractWeb(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedPartner() del adaptador 'sapcrmWeb' para recuperar el contacto
    private getOptimizedPartner(webAdapterRequestConfig: WebAdapterRequestConfig, act_list: string, crmv3: string, id: string, partnerguid: string) {

        return new Promise<Partner>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, act_list, crmv3, this.loginProvider.user.lang, id, partnerguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataPartner(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedPartnersList() del adaptador 'sapcrmWeb' para recuperar los datos mediante paginacion
    private getPageOptimizedPartnersList(webAdapterRequestConfig: WebAdapterRequestConfig, from: number, to: number, typePartner: string, contactFilter: string): Promise<PartnersWeb> {

        return new Promise<PartnersWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, from, to, this.loginProvider.user.lang, typePartner, this.loginProvider.user.id, contactFilter];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataPartnersList(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedActivity() del adaptador 'sapcrmWeb' para recuperar la actividad abstracta
    private getOptimizedActivityAbstractWeb(webAdapterRequestConfig: WebAdapterRequestConfig, activityguid: string): Promise<ActivityAbstractWeb> {
        
        return new Promise<ActivityAbstractWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, activityguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataActivityAbstractWeb(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedActivity() del adaptador 'sapcrmWeb' para recuperar la actividad
    private getOptimizedActivity(webAdapterRequestConfig: WebAdapterRequestConfig, activityguid: string): Promise<Activity> {
        
        return new Promise<Activity>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, activityguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataActivity(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedActivitiesList() del adaptador 'sapcrmWeb' para recuperar los datos mediante paginacion
    private getPageOptimizedActivitiesList(webAdapterRequestConfig: WebAdapterRequestConfig, from: number, to: number, activityFilter: string): Promise<ActivitiesWeb> {
        
        return new Promise<ActivitiesWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, from, to, this.loginProvider.user.lang, this.loginProvider.user.id, activityFilter];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataActivitiesList(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedActivity() del adaptador 'sapcrmWeb' para recuperar la orden abstracta
    private getOptimizedOrderAbstractWeb(webAdapterRequestConfig: WebAdapterRequestConfig, orderguid: string): Promise<OrderAbstractWeb> {
        
        return new Promise<OrderAbstractWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, orderguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataOrderAbstractWeb(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedActivity() del adaptador 'sapcrmWeb' para recuperar la orden
    private getOptimizedOrder(webAdapterRequestConfig: WebAdapterRequestConfig, orderguid: string): Promise<Order> {
        
        return new Promise<Order>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, orderguid];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataOrder(this.utils.fixArrays(data)));
            }, reject);

        });

    }

    //Funcion que llama al metodo getOptimizedOrdersList() del adaptador 'sapcrmWeb' para recuperar los datos mediante paginacion
    private getPageOptimizedOrdersList(webAdapterRequestConfig: WebAdapterRequestConfig, from: number, to: number, orderFilter: string, typeOrder: string): Promise<OrdersWeb> {
        
        return new Promise<OrdersWeb>((resolve, reject) => {

            var resourceRequest = new WL.ResourceRequest("/adapters/sapcrmWeb/" + webAdapterRequestConfig.adapterMethod, WL.ResourceRequest.GET, 120000);
            let params = [AppSettings.SECURITY_TOKEN, from, to, this.loginProvider.user.lang, orderFilter, typeOrder, this.loginProvider.user.id];

            resourceRequest.setQueryParameter("params", JSON.stringify(params));
            resourceRequest.send().then((response) => {
                let data = response.responseJSON.Envelope.Body[webAdapterRequestConfig.responseBodyName + ".Response"];
                resolve(this.fixDataOrdersList(this.utils.fixArrays(data)));
            }, reject);

        });

    }










    //Funcion que retorna los datos obtenidos en el metodo getOptimizedPartner() del adaptador 'sapcrmWeb'
    public syncOptimizedPartnerAbstractWeb(act_list: string, id: string, partnerguid: string): Promise<PartnerAbstractWeb> {
        return this.getOptimizedPartnerAbstractWeb(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_PARTNER, act_list, 'X', id, partnerguid).then((partner) => {
            return partner;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedPartner() del adaptador 'sapcrmWeb'
    public syncOptimizedPartner(act_list: string, id: string, partnerguid: string): Promise<Partner> {
        return this.getOptimizedPartner(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_PARTNER, act_list, 'X', id, partnerguid).then((partner) => {
            return partner;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedPartnersList() del adaptador 'sapcrmWeb'
    public syncPageOptimizedPartnersList(from: number, to: number, typePartner: string, contactFilter: string): Promise<PartnersWeb> {
        return this.getPageOptimizedPartnersList(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_PARTNERS_LIST, from, to, typePartner, contactFilter.toUpperCase()).then((partners) => {
            return partners;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    public syncOptimizedActivityAbstractWeb(activityguid: string): Promise<ActivityAbstractWeb> {
        return this.getOptimizedActivityAbstractWeb(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ACTIVITY, activityguid).then((activity) => {
            return activity;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    public syncOptimizedActivity(activityguid: string): Promise<Activity> {
        return this.getOptimizedActivity(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ACTIVITY, activityguid).then((activity) => {
            return activity;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedActivitiesList() del adaptador 'sapcrmWeb'
    public syncPageOptimizedActivitiesList(from: number, to: number, activityFilter: string): Promise<ActivitiesWeb> {
        return this.getPageOptimizedActivitiesList(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ACTIVITIES_LIST, from, to, activityFilter).then((activities) => {
            return activities;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    public syncOptimizedOrderAbstractWeb(orderguid: string): Promise<OrderAbstractWeb> {
        return this.getOptimizedOrderAbstractWeb(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ORDER, orderguid).then((order) => {
            return order;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    public syncOptimizedOrder(orderguid: string): Promise<Order> {
        return this.getOptimizedOrder(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ORDER, orderguid).then((order) => {
            return order;
        });
    }

    //Funcion que retorna los datos obtenidos en el metodo getOptimizedOrdersList() del adaptador 'sapcrmWeb'
    public syncPageOptimizedOrdersList(from: number, to: number, orderFilter: string, typeOrder: string): Promise<OrdersWeb> {
        return this.getPageOptimizedOrdersList(AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ORDERS_LIST, from, to, orderFilter.toUpperCase(), typeOrder).then((orders) => {
            return orders;
        });
    }










    //Funcion que arregla los datos obtenidos en el metodo getOptimizedPartner() del adaptador 'sapcrmWeb'
    private fixDataPartnerAbstractWeb(data: any): PartnerAbstractWeb {
        let partner: PartnerAbstractWeb = this.castPartnerToPartnerAbstractWeb(data.O_PARTNER);

        return partner;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedPartner() del adaptador 'sapcrmWeb'
    private fixDataPartner(data: any): Partner {
        let partner: Partner = data.O_PARTNER;

        return partner;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedPartnersList() del adaptador 'sapcrmWeb'
    private fixDataPartnersList(data: any): PartnersWeb {
        let partnersWeb: PartnersWeb = {
            MAX_PARTNERS: data.O_MAXPARTNERS,
            PARTNERS: this.castPartnersToPartnersAbstractWeb(data.T_PARTNER)
        }

        return partnersWeb;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    private fixDataActivityAbstractWeb(data: any): ActivityAbstractWeb {
        let activity: ActivityAbstractWeb = this.castActivityToActivityAbstractWeb(data);

        return activity;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    private fixDataActivity(data: any): Activity {
        let dataActivity = {
            HEADER : data.HEADER,
            DATE : data.DATE,
            MATERIAL_TAB : data.MATERIAL_TAB,
            OUTCOME : data.OUTCOME,
            PARTNERS : data.PARTNERS,
            REASON : data.REASON,
            STATUS_TAB : data.STATUS_TAB,
            TEXT : data.TEXT,
            DATE_1: "",
            DATE_2: "",
            DATE_3: "",
            DATE_4: "", 
            ZZICALGUID: "",
            DATETIME_FROM: "",
            DATETIME_TO: ""
        };
        
        let activity: Activity = JSON.parse(JSON.stringify(dataActivity));
        AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ACTIVITIES_LIST.preInsert(activity);

        return activity;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedActivitiesList() del adaptador 'sapcrmWeb'
    private fixDataActivitiesList(data: any): ActivitiesWeb {
        let activitiesWeb: ActivitiesWeb = {
            TOTALACTIVITIES: data.O_TOTALACTIVITIES,
            MAX_ACTIVITIES: data.O_MAXACTIVITIES,
            ACTIVITIES: this.castActivitiesToActivitiesAbstractWeb(data.T_ACTIVITY)
        }

        return activitiesWeb;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    private fixDataOrderAbstractWeb(data: any): OrderAbstractWeb {
        let order: OrderAbstractWeb = this.castOrderToOrderAbstractWeb(data);

        return order;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedActivity() del adaptador 'sapcrmWeb'
    private fixDataOrder(data: any): Order {
        let dataOrder = {
            HEADER : data.HEADER,
            DATE : data.DATE,
            MATERIAL_TAB : data.MATERIAL_TAB,
            OUTCOME : data.OUTCOME,
            PARTNERS : data.PARTNERS,
            REASON : data.REASON,
            STATUS_TAB : data.STATUS_TAB,
            TEXT : data.TEXT,
            DATE_1: "",
            DATE_2: "",
            DATE_3: "",
            DATE_4: "", 
            ZZICALGUID: "",
            DATETIME_FROM: "",
            DATETIME_TO: ""
        };
        
        let order: Order = JSON.parse(JSON.stringify(dataOrder));
        AppSettings.WEB_ADAPTER_REQUEST_CONFIG_ORDERS_LIST.preInsert(order);

        return order;
    }

    //Funcion que arregla los datos obtenidos en el metodo getOptimizedOrdersList() del adaptador 'sapcrmWeb'
    private fixDataOrdersList(data: any): OrdersWeb {
        let ordersWeb: OrdersWeb = {
            MAX_ORDERS: data.O_MAXACTIVITIES,
            ORDERS: this.castOrdersToOrdersAbstractWeb(data.T_ACTIVITY)
        }

        return ordersWeb;
    }










    //Funcion que adapta el contacto con la estructura 'Partner' a la estructura 'PartnerAbstractWeb'
    private castPartnerToPartnerAbstractWeb(partner: Partner): PartnerAbstractWeb {
        let partnerAbstractWeb: PartnerAbstractWeb = AppSettings.PARTNER_ABSTRACT_WEB_PARSE(partner);

        return partnerAbstractWeb;
    }

    //Funcion que adapta los contactos con la estructura 'Partner' a la estructura 'PartnerAbstractWeb'
    private castPartnersToPartnersAbstractWeb(partners: Partner[]): PartnerAbstractWeb[] {
        let partnersAbstractWeb: PartnerAbstractWeb[] = [];

        for (let partner of partners) {
            partnersAbstractWeb.push(AppSettings.PARTNER_ABSTRACT_WEB_PARSE(partner));
        }

        return partnersAbstractWeb;
    }

    //Funcion que adapta los contactos con la estructura 'Activity' a la estructura 'ActivityAbstractWeb'
    private castActivityToActivityAbstractWeb(activity: Activity): ActivityAbstractWeb {
        let activityAbstractWeb: ActivityAbstractWeb = AppSettings.ACTIVITY_ABSTRACT_WEB_PARSE(activity);

        return activityAbstractWeb;
    }

    //Funcion que adapta los contactos con la estructura 'Activity' a la estructura 'ActivityAbstractWeb'
    private castActivitiesToActivitiesAbstractWeb(activities: Activity[]): ActivityAbstractWeb[] {
        let activitiesAbstractWeb: ActivityAbstractWeb[] = [];

        for (let activity of activities) {
            activitiesAbstractWeb.push(AppSettings.ACTIVITY_ABSTRACT_WEB_PARSE(activity));
        }

        return activitiesAbstractWeb;
    }

    //Funcion que adapta los contactos con la estructura 'Order' a la estructura 'OrderAbstractWeb'
    private castOrderToOrderAbstractWeb(order: Order): OrderAbstractWeb {
        let orderAbstractWeb: OrderAbstractWeb = AppSettings.ORDER_ABSTRACT_WEB_PARSE(order);

        return orderAbstractWeb;
    }

    //Funcion que adapta los contactos con la estructura 'Order' a la estructura 'OrderAbstractWeb'
    private castOrdersToOrdersAbstractWeb(orders: Order[]): OrderAbstractWeb[] {
        let ordersAbstractWeb: OrderAbstractWeb[] = [];

        for (let order of orders) {
            ordersAbstractWeb.push(AppSettings.ORDER_ABSTRACT_WEB_PARSE(order));
        }

        return ordersAbstractWeb;
    }
}