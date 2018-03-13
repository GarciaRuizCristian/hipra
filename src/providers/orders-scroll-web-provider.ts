import { Injectable } from "@angular/core";
import { TranslateService } from "ng2-translate";
import { AppSettings } from "../config/app-settings";
import { Partner } from "../models/partner";
import { OperationsClass } from "../models/operations_class";
import { Status } from "../models/status";
import { OrderAbstractWeb } from "../models/orderAbstractWeb";
import { UtilsProvider } from "./utils-provider";
import { SapcrmWebProvider } from "./sapcrm-web-provider";
import { SapcrmCacheProvider } from "./sapcrm-cache-provider";


@Injectable()
export class OrdersScrollWebProvider {
    userLogged: Partner;
    
    operations: Array<OperationsClass> = [];
    states: Array<Status>;

    actualPageOpportunity: Array<OrderAbstractWeb> = [];
    actualPageSale: Array<OrderAbstractWeb> = [];
    actualOrderType = "opportunity";

    totalOfOrders: number = 0;
    totalOfOpportunities: number = 0;
    totalOfSales: number = 0;

    currentPageOpportunity: number = 0;
    currentPageSale: number = 0;
    maxPageOpportunities: number = 0;
    minPageOpportunities: number = 0;
    maxPageSales: number = 0;
    minPageSales: number = 0;

    fromOpportunity: number;
    fromSale: number;
    toOpportunity: number;
    toSale: number;
    pageSize: number;

    loadingOpportunities: boolean = true;
    loadingSales: boolean = true;

    cdRef;

    constructor(private sapcrmWebProvider: SapcrmWebProvider,
        private sapcrmCacheProvider: SapcrmCacheProvider,
        private translate: TranslateService,
        private utils: UtilsProvider) {

    }

    //Funcion que almacena todos los datos
    public loadAllData(from: number, to: number, orderFilter: string) {
        this.loadOperationsClasses().then(() => {
            this.loadStatus().then(() => {
                this.loadOrders(from, to, orderFilter);
            });
        });
    }

    //Funcion que almacena los diferentes tipos de ordenes: "Oportunidad" (Z007) o "Orden de venta" (Z014) 
    public loadOperationsClasses(): Promise<void> {
        return this.sapcrmCacheProvider.getOperationClasses().then(
            (res: OperationsClass[]) => {
                this.operations = [];
                for (let operation of res) {
                    if (operation.PROCESS_TYPE == AppSettings.ORDER_TYPE_OPPORTUNITY || operation.PROCESS_TYPE == AppSettings.ORDER_TYPE_SALES) {
                        if (operation.P_DESCRIPTION_20 == "Solicitud Pedido") {
                            this.translate.get('SalesOrder').subscribe(
                                salesOrder => {
                                    operation.P_DESCRIPTION_20 = salesOrder;
                                });
                        } else if (operation.P_DESCRIPTION_20 == "Oportunidad") {
                            this.translate.get('Opportunity').subscribe(
                                opportunity => {
                                    operation.P_DESCRIPTION_20 = opportunity;
                                });
                        }
                        this.operations.push(operation);
                    }
                }
            },
            (error) => {
                console.log(error);
            });
    }

    //Funcion que almacena los diferentes estados que pueden tener las ordenes "Oportunidad" (Z007) o "Orden de venta" (Z014): "Abierto", "En tratamiento", "Concluido" ...?
    public loadStatus(): Promise<void> {
        return this.sapcrmCacheProvider.getStatus().then(
            (res: Status[]) => {
                this.states = [];
                for (let status of res) {
                    if (status.PROCESS_TYPE == AppSettings.ORDER_TYPE_OPPORTUNITY || status.PROCESS_TYPE == AppSettings.ORDER_TYPE_SALES) {
                        this.states.push(status);
                    }
                }

                this.states.sort(function (a, b) {
                    if (a.TXT30 != undefined) {
                        return a.TXT30.localeCompare(b.TXT30, "ca-ES");
                    }
                });
            },
            (error) => {
                console.log(error);
            });
    }

    //Funcion que almacena las todas las ordenes (Oportunidades y Ordenes de venta) y las muestra
    public loadOrders(from: number, to: number, orderFilter: string): Promise<void> {
        return this.loadOpportunityOrders(from, to, orderFilter).then(
            () => {
                return this.loadSalesOrders(from, to, orderFilter).then(
                    () => {
                        this.totalOfOrders = this.totalOfOpportunities + this.totalOfSales;
                    });
            });
    }

    //Funcion que carga las oportunidades, mediante paginacion
    public loadOpportunityOrders(from: number, to: number, orderFilter: string): Promise<void> {
        this.loadingOpportunities = true;
        this.fromOpportunity = from;
        this.toOpportunity = to;

        return this.sapcrmWebProvider.syncPageOptimizedOrdersList(from, to, orderFilter, AppSettings.ORDER_TYPE_OPPORTUNITY_WEB).then((opportunities) => {
            this.totalOfOpportunities = Number(opportunities.MAX_ORDERS);
            this.totalOfOrders = this.totalOfOpportunities + this.totalOfSales;
            this.maxPageOpportunities = this.totalOfOpportunities % this.pageSize == 0 ? this.totalOfOpportunities / this.pageSize - 1 : Math.floor(this.totalOfOpportunities / this.pageSize);
            this.fixDate(opportunities.ORDERS);
            this.actualPageOpportunity = opportunities.ORDERS;
            this.loadingOpportunities = false;

            if (this.cdRef != null) {
                try {
                    this.cdRef.detectChanges();
                } catch (e) { }
            }
        }, (error) => {
            this.loadingOpportunities = false;
            console.log("WEB - OrdersScrollWebProvider - loadOpportunityOrders(): " + JSON.stringify(error, null, 2));
        });
    }

    //Funcion que carga las ordenes de venta, mediante paginacion
    public loadSalesOrders(from: number, to: number, orderFilter: string): Promise<void> {
        this.loadingSales = true;
        this.fromSale = from;
        this.toSale = to;

        return this.sapcrmWebProvider.syncPageOptimizedOrdersList(from, to, orderFilter, AppSettings.ORDER_TYPE_SALES_WEB).then((sales) => {
            this.totalOfSales = Number(sales.MAX_ORDERS);
            this.totalOfOrders = this.totalOfOpportunities + this.totalOfSales;
            this.maxPageSales = this.totalOfSales % this.pageSize == 0 ? this.totalOfSales / this.pageSize - 1 : Math.floor(this.totalOfSales / this.pageSize);
            this.fixDate(sales.ORDERS);
            this.actualPageSale = sales.ORDERS;
            this.loadingSales = false;

            if (this.cdRef != null) {
                try {
                    this.cdRef.detectChanges();
                } catch (e) { }
            }
        }, (error) => {
            this.loadingSales = false;
            console.log("WEB - OrdersScrollWebProvider - loadSaleOrders(): " + JSON.stringify(error, null, 2));
        });
    }

    //Funcion que calcula el numero de ordenes que entran en cada pagina, segun el tamanio de la ventana
    public setMaxHeight(height: number, width: number, cdRef, orderFilter: string) {
        this.cdRef = cdRef;

        let rows = Math.floor(height / 137);
        let cols = width < 494 ? 1 : width < 705 ? 2 : width < 880 ? 3 : 4;
        this.pageSize = rows * cols;

        if (this.operations.length <= 0 || this.states.length <= 0)
            this.loadAllData(1, this.pageSize, orderFilter);
        else if (this.actualOrderType == "opportunity")
            this.loadOpportunityOrders(1, this.pageSize, orderFilter);
        else if (this.actualOrderType == "sales")
            this.loadSalesOrders(1, this.pageSize, orderFilter);
    }

    //Funcion que carga la siguiente pagina de ordenes
    public moveToNextSlideOpportunity(orderFilter: string) {
        if (this.currentPageOpportunity == this.maxPageOpportunities)
            return;

        this.currentPageOpportunity++;
        this.loadOpportunityOrders((this.toOpportunity + 1), (this.toOpportunity + this.pageSize), orderFilter);
    }

    //Funcion que carga la anterior pagina de ordenes
    public moveToPreviousSlideOpportunity(orderFilter: string) {
        if (this.currentPageOpportunity == this.minPageOpportunities)
            return;

        this.currentPageOpportunity--;
        this.loadOpportunityOrders((this.fromOpportunity - this.pageSize), (this.fromOpportunity - 1), orderFilter);
    }

    //Funcion que carga una determinada pagina de ordenes
    public movePageRangeOpportunity(page: number, orderFilter: string) {
        this.currentPageOpportunity = page;
        this.loadOpportunityOrders(((this.pageSize * page) + 1), ((this.pageSize * page) + this.pageSize), orderFilter);
    }

    //Funcion que carga la siguiente pagina de ordenes
    public moveToNextSlideSale(orderFilter: string) {
        if (this.currentPageSale == this.maxPageSales)
            return;

        this.currentPageSale++;
        this.loadSalesOrders((this.toSale + 1), (this.toSale + this.pageSize), orderFilter);
    }

    //Funcion que carga la anterior pagina de ordenes
    public moveToPreviousSlideSale(orderFilter: string) {
        if (this.currentPageSale == this.minPageSales)
            return;

        this.currentPageSale--;
        this.loadSalesOrders((this.fromSale - this.pageSize), (this.fromSale - 1), orderFilter);
    }

    //Funcion que carga una determinada pagina de ordenes
    public movePageRangeSale(page: number, orderFilter: string) {
        this.currentPageSale = page;
        this.loadSalesOrders(((this.pageSize * page) + 1), ((this.pageSize * page) + this.pageSize), orderFilter);
    }

    public setUserLogged(user: Partner) {
        this.userLogged = user;
    }

    public getUserLogged(): Partner {
        return this.userLogged;
    }

    //Funcion que retorna el estado en texto de una determinada orden
    public getStatusTxt30(order) {
        if (this.states) {
            for (let state of this.states) {
                if (state.PROCESS_TYPE == order.PROCESS_TYPE && state.STATUS == order.STATUS_TAB[0].STATUS) {
                    return state.TXT30;
                }
            }
        }
        return "-";
    }

    //Funcion que otorga el formato correcto a la fecha
    public fixDate(orders: OrderAbstractWeb[]) {
        for (let order of orders) {
            if (order.DATETIME_TO != '' && order.DATETIME_TO != undefined) {
                order.DATETIME_TO = this.utils.dateToddMMyyyy(new Date(order.DATETIME_TO), '/');
            }
        }
    }
}