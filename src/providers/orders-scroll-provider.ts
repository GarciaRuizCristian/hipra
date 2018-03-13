import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { SapcrmCacheProvider } from './sapcrm-cache-provider';
import { SapcrmProvider } from './sapcrm-provider';
import { UtilsProvider } from './utils-provider';
import { OrderAbstract } from '../models/orderAbstract';
import { OperationsClass } from '../models/operations_class';
import { Status } from '../models/status';
import { Partner } from '../models/partner';
import { AppSettings } from '../config/app-settings';


@Injectable()
export class OrdersScrollProvider {
    loadingOpportunities: boolean = true;
    loadingSales: boolean = true;

    userLogged: Partner;

    actualOrderType = "opportunity";

    actualPageOpportunity: Array<OrderAbstract> = [];
    currentPageOpportunity: number = 0;
    actualPageSale: Array<OrderAbstract> = [];
    currentPageSale: number = 0;

    pageSize: number = 0;

    maxPageOpportunities: number = 0;
    minPageOpportunities: number = 0;
    maxPageSales: number = 0;
    minPageSales: number = 0;

    TotalOfLoadedOpportunities: number = AppSettings.MAX_ORDERS_LOADED;//144 1152;
    TotalOfLoadedSales: number = AppSettings.MAX_ORDERS_LOADED;//144 1152;    
    totalOfOpportunities: number = 0;
    totalOfOpportunitiesUnchanged: number = 0;
    totalOfFilteredOpportunities: number = 0;
    totalOfSales: number = 0;
    totalOfSalesUnchanged: number = 0;
    totalOfFilteredSales: number = 0;
    totalOfOrders: number = 0;
    totalOfOrdersUnchanged: number = 0;
    totalOfFilteredOrders: number = 0;

    pageOpportunityLoadedFrom: number;
    pageOpportunityLoadedTo: number;
    pageOpportunityDistanceCovered: number;
    pageSaleLoadedFrom: number;
    pageSaleLoadedTo: number;
    pageSaleDistanceCovered: number;

    pageOpportunityFilteredLoadedFrom: number;
    pageOpportunityFilteredLoadedTo: number;
    pageOpportunityFilteredDistanceCovered: number;
    pageSaleFilteredLoadedFrom: number;
    pageSaleFilteredLoadedTo: number;
    pageSaleFilteredDistanceCovered: number;

    currentOpportunityPaginationNumber: number = 0;
    currentOpportunityFilteredPaginationNumber: number = 0;
    currentSalePaginationNumber: number = 0;
    currentSaleFilteredPaginationNumber: number = 0;

    operations: Array<OperationsClass> = [];
    states: Array<Status>;
    opportunityOrders: Array<OrderAbstract> = [];
    opportunityOrdersFiltered: Array<OrderAbstract> = [];
    saleOrders: Array<OrderAbstract> = [];
    saleOrdersFiltered: Array<OrderAbstract> = [];

    rangeFilter: {
        search: string,
        stateOpen: boolean,
        stateProcessing: boolean,
        stateClose: boolean,
        has: boolean
    } = {
            search: "",
            stateOpen: false,
            stateProcessing: false,
            stateClose: false,
            has: false
        };

    cdRef;

    constructor(
        private sapcrmProvider: SapcrmProvider, private sapcrmCacheProvider: SapcrmCacheProvider,
        private translate: TranslateService, private utils: UtilsProvider
    ) {

    }

    //Funcion que almacena todos los datos
    public loadAllData() {
        this.loadOperationsClasses().then(() => {
            this.loadStatus().then(() => {
                this.loadTotalOfOrders().then(() => {
                    this.loadOrders(0, 0);
                });
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
    public loadOrders(pageLoad: number, pageCurrent: number): Promise<void> {
        return this.loadOpportunityOrders(pageLoad).then(
            () => {
                return this.loadSalesOrders(pageLoad).then(
                    () => {
                        this.setCurrentOpportunitiesPages(pageCurrent);
                        this.setCurrentSalesPages(pageCurrent);
                    });
            });
    }

    //Funcion que almacena todas las Oportunidades
    public loadOpportunityOrders(page: number): Promise<void> {
        this.loadingOpportunities = true;
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_OPPORTUNITY);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        return this.sapcrmProvider.getOrdersAbstracts(whereClause, whereValues, this.currentOpportunityPaginationNumber, this.TotalOfLoadedOpportunities, "DATETIME_TO DESC").then(
            (res: OrderAbstract[]) => {
                this.fixDate(res);
                this.opportunityOrders = res;
                this.pageOpportunityLoadedFrom = page * this.TotalOfLoadedOpportunities / this.pageSize;
                this.pageOpportunityLoadedTo = this.pageOpportunityLoadedFrom + this.TotalOfLoadedOpportunities / this.pageSize - 1;
                this.pageOpportunityDistanceCovered = this.pageOpportunityLoadedTo - this.pageOpportunityLoadedFrom + 1;
            },
            (error) => {
                console.log(error);
            });
    }

    //Funcion que almacena todas las Ordenes de venta
    public loadSalesOrders(page: number): Promise<void> {
        this.loadingSales = true;
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_SALES);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        return this.sapcrmProvider.getOrdersAbstracts(whereClause, whereValues, this.currentSalePaginationNumber, this.TotalOfLoadedSales, "DATETIME_TO DESC").then(
            (res: OrderAbstract[]) => {
                this.fixDate(res);
                this.saleOrders = res;
                this.pageSaleLoadedFrom = page * this.TotalOfLoadedSales / this.pageSize;
                this.pageSaleLoadedTo = this.pageSaleLoadedFrom + this.TotalOfLoadedSales / this.pageSize - 1;
                this.pageSaleDistanceCovered = this.pageSaleLoadedTo - this.pageSaleLoadedFrom + 1;
            },
            (error) => {
                console.log(error);
            });
    }

    //Funcion que almacena las todas las ordenes filtradas (Oportunidades y Ordenes de venta) y las muestra
    public loadFilteredOrders(filter, pageLoad: number, pageCurrent: number): Promise<void> {
        return this.loadFilteredOpportunityOrders(filter, pageLoad).then(
            () => {
                return this.loadFilteredSalesOrders(filter, pageLoad).then(
                    () => {
                        this.setCurrentFilteredOpportunitiesPages(pageCurrent);
                        this.setCurrentFilteredSalesPages(pageCurrent);
                    });
            });
    }

    //Funcion que almacena todas las Oportunidades filtradas
    public loadFilteredOpportunityOrders(filter, page: number): Promise<void> {
        this.loadingOpportunities = true;
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_OPPORTUNITY);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        if (filter.search) {
            whereClause += " AND (ID LIKE ? OR REQUESTOR_FULLNAME LIKE ?)"
            whereValues.push('%'+filter.search.toUpperCase()+'%');
            whereValues.push('%'+filter.search.toUpperCase()+'%');
        }

        if (filter.stateOpen || filter.stateClose || filter.stateProcessing) {
            let filtrosState = [];
            if (filter.stateOpen)
                filtrosState.push(0);
            if (filter.stateClose)
                filtrosState.push(2);
            if (filter.stateProcessing)
                filtrosState.push(1);

            whereClause += " AND (ORDER_STATE =?";
            whereValues.push(filtrosState[0]);

            for (let i = 1; i < filtrosState.length; i++) {
                whereClause += " OR ORDER_STATE =?";
                whereValues.push(filtrosState[i]);
            }

            whereClause += ")";
        }

        return this.sapcrmProvider.getOrdersAbstracts(whereClause, whereValues, this.currentOpportunityFilteredPaginationNumber, this.TotalOfLoadedOpportunities, "DATETIME_TO DESC").then(
            (res: OrderAbstract[]) => {
                this.fixDate(res);
                this.opportunityOrdersFiltered = res;
                this.pageOpportunityFilteredLoadedFrom = page * this.TotalOfLoadedOpportunities / this.pageSize;
                this.pageOpportunityFilteredLoadedTo = this.pageOpportunityFilteredLoadedFrom + this.TotalOfLoadedOpportunities / this.pageSize - 1;
                this.pageOpportunityFilteredDistanceCovered = this.pageOpportunityFilteredLoadedTo - this.pageOpportunityFilteredLoadedFrom + 1;
            },
            (error) => {
                console.log(error);
            });
    }

    //Funcion que almacena todas las Ordenes de venta filtradas
    public loadFilteredSalesOrders(filter, page: number): Promise<void> {
        this.loadingSales = true;
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_SALES);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        if (filter.search) {
            whereClause += " AND (ID LIKE ? OR REQUESTOR_FULLNAME LIKE ?)"
            whereValues.push('%'+filter.search.toUpperCase()+'%');
            whereValues.push('%'+filter.search.toUpperCase()+'%');
        }

        if (filter.stateOpen || filter.stateClose || filter.stateProcessing) {
            let filtrosState = [];
            if (filter.stateOpen)
                filtrosState.push(0);
            if (filter.stateClose)
                filtrosState.push(2);
            if (filter.stateProcessing)
                filtrosState.push(1);

            whereClause += " AND (ORDER_STATE =?";
            whereValues.push(filtrosState[0]);

            for (let i = 1; i < filtrosState.length; i++) {
                whereClause += " OR ORDER_STATE =?";
                whereValues.push(filtrosState[i]);
            }

            whereClause += ")";
        }

        return this.sapcrmProvider.getOrdersAbstracts(whereClause, whereValues, this.currentSaleFilteredPaginationNumber, this.TotalOfLoadedSales, "DATETIME_TO DESC").then(
            (res: OrderAbstract[]) => {
                this.fixDate(res);
                this.saleOrdersFiltered = res;
                this.pageSaleFilteredLoadedFrom = page * this.TotalOfLoadedSales / this.pageSize;
                this.pageSaleFilteredLoadedTo = this.pageSaleFilteredLoadedFrom + this.TotalOfLoadedSales / this.pageSize - 1;
                this.pageSaleFilteredDistanceCovered = this.pageSaleFilteredLoadedTo - this.pageSaleFilteredLoadedFrom + 1;
            },
            (error) => {
                console.log(error);
            });
    }

    public loadTotalOfOrders(): Promise<void> {
        return this.loadTotalOfOpportunities().then(
            () => {
                return this.loadTotalOfSales().then(
                    () => {
                        this.calculateTotalOfOrders(false);
                    });
            });
    }

    public loadTotalOfOpportunities() {
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_OPPORTUNITY);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        return this.sapcrmProvider.getOrdersCount(AppSettings.STORE_CONFIG_ACTIVITIES, whereClause, whereValues).then(
            res => {
                this.totalOfOpportunities = res;
                this.totalOfOpportunitiesUnchanged = res;
            }
        );
    }

    public loadTotalOfSales() {
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_SALES);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        return this.sapcrmProvider.getOrdersCount(AppSettings.STORE_CONFIG_ACTIVITIES, whereClause, whereValues).then(
            res => {
                this.totalOfSales = res;
                this.totalOfSalesUnchanged = res;
            }
        );
    }

    public loadTotalOfFilteredOrders(filter): Promise<void> {
        return this.loadTotalOfFilteredOpportunities(filter).then(
            () => {
                return this.loadTotalOfFilteredSales(filter).then(
                    () => {
                        this.calculateTotalOfOrders(true);
                    });
            });
    }

    public loadTotalOfFilteredOpportunities(filter) {
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_OPPORTUNITY);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        if (filter.search) {
            whereClause += " AND (ID LIKE ? OR REQUESTOR_FULLNAME LIKE ?)"
            whereValues.push('%'+filter.search.toUpperCase()+'%');
            whereValues.push('%'+filter.search.toUpperCase()+'%');
        }

        if (filter.stateOpen || filter.stateClose || filter.stateProcessing) {
            let filtrosState = [];
            if (filter.stateOpen)
                filtrosState.push(0);
            if (filter.stateClose)
                filtrosState.push(2);
            if (filter.stateProcessing)
                filtrosState.push(1);

            whereClause += " AND (ORDER_STATE =?";
            whereValues.push(filtrosState[0]);

            for (let i = 1; i < filtrosState.length; i++) {
                whereClause += " OR ORDER_STATE =?";
                whereValues.push(filtrosState[i]);
            }

            whereClause += ")";
        }

        return this.sapcrmProvider.getPartnersCount(AppSettings.STORE_CONFIG_ACTIVITIES, whereClause, whereValues).then(
            res => {
                this.totalOfFilteredOpportunities = res;
            }
        );
    }

    public loadTotalOfFilteredSales(filter) {
        let whereClause = "";
        let whereValues = [];

        whereClause += "PROCESS_TYPE =?";
        whereValues.push(AppSettings.ORDER_TYPE_SALES);

        whereClause += " AND EMPLOYEE_RESPONSIBLE_FULLNAME LIKE ?";
        whereValues.push('%'+this.userLogged.CENTRAL_ORGAN.NAME1+'%');

        if (filter.search) {
            whereClause += " AND (ID LIKE ? OR REQUESTOR_FULLNAME LIKE ?)"
            whereValues.push('%'+filter.search.toUpperCase()+'%');
            whereValues.push('%'+filter.search.toUpperCase()+'%');
        }

        if (filter.stateOpen || filter.stateClose || filter.stateProcessing) {
            let filtrosState = [];
            if (filter.stateOpen)
                filtrosState.push(0);
            if (filter.stateClose)
                filtrosState.push(2);
            if (filter.stateProcessing)
                filtrosState.push(1);

            whereClause += " AND (ORDER_STATE =?";
            whereValues.push(filtrosState[0]);

            for (let i = 1; i < filtrosState.length; i++) {
                whereClause += " OR ORDER_STATE =?";
                whereValues.push(filtrosState[i]);
            }

            whereClause += ")";
        }

        return this.sapcrmProvider.getPartnersCount(AppSettings.STORE_CONFIG_ACTIVITIES, whereClause, whereValues).then(
            res => {
                this.totalOfFilteredSales = res;
            }
        );
    }

    //Funcion que almacena las ordenes (Oportunidades u Ordenes de venta) que cumplen el filtro
    public loadDataFiltered (typeData: string, filter) {
        let dataFiltered: Array<OrderAbstract> = [];
        let dataAll: Array<OrderAbstract> = (typeData == "opportunity") ? this.opportunityOrders : this.saleOrders;

        let numFilter: number = this.transformFilterToNum(filter);

        if (filter.search != "" && (filter.stateOpen || filter.stateProcessing || filter.stateClose)) {
            switch (numFilter) {
                case 1:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 2))
                            dataFiltered.push(data);
                    }
                    break;
                case 2:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 1))
                            dataFiltered.push(data);
                    }
                    break;
                case 3:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 1 || data.STATE == 2))
                            dataFiltered.push(data);
                    }
                    break;
                case 4:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 0))
                            dataFiltered.push(data);
                    }
                    break;
                case 5:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 0 || data.STATE == 2))
                            dataFiltered.push(data);
                    }
                    break;
                case 6:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 0 || data.STATE == 1))
                            dataFiltered.push(data);
                    }
                    break;
                case 7:
                    for (let data of dataAll) {
                        if ((data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                            && (data.STATE == 0 || data.STATE == 1 || data.STATE == 2))
                            dataFiltered.push(data);
                    }
                    break;
            }
        } else if (filter.search != "") {
            for (let data of dataAll) {
                if (data.ID.indexOf(filter.search) >= 0 || this.getRequestorName(data.PARTNERS).toUpperCase().indexOf(filter.search.toUpperCase()) >= 0)
                    dataFiltered.push(data);
            }
        } else if (filter.stateOpen || filter.stateProcessing || filter.stateClose) {
            switch (numFilter) {
                case 1:
                    for (let data of dataAll) {
                        if (data.STATE == 2)
                            dataFiltered.push(data);
                    }
                    break;
                case 2:
                    for (let data of dataAll) {
                        if (data.STATE == 1)
                            dataFiltered.push(data);
                    }
                    break;
                case 3:
                    for (let data of dataAll) {
                        if (data.STATE == 1 || data.STATE == 2)
                            dataFiltered.push(data);
                    }
                    break;
                case 4:
                    for (let data of dataAll) {
                        if (data.STATE == 0)
                            dataFiltered.push(data);
                    }
                    break;
                case 5:
                    for (let data of dataAll) {
                        if (data.STATE == 0 || data.STATE == 2)
                            dataFiltered.push(data);
                    }
                    break;
                case 6:
                    for (let data of dataAll) {
                        if (data.STATE == 0 || data.STATE == 1)
                            dataFiltered.push(data);
                    }
                    break;
                case 7:
                    for (let data of dataAll) {
                        if (data.STATE == 0 || data.STATE == 1 || data.STATE == 2)
                            dataFiltered.push(data);
                    }
                    break;
            }
        }

        if (typeData == "opportunity") {
            this.opportunityOrdersFiltered = dataFiltered.slice();
            this.totalOfFilteredOpportunities = this.opportunityOrdersFiltered.length;
            this.setCurrentFilteredOpportunitiesPages(0);
        }
        else if (typeData == "sales") {
            this.saleOrdersFiltered = dataFiltered.slice();
            this.totalOfFilteredSales = this.saleOrdersFiltered.length;
            this.setCurrentFilteredSalesPages(0);
        }
    }

    //Funcion que otorga el formato correcto a la fecha
    public fixDate(orders: OrderAbstract[]) {
        for (let order of orders) {
            if (order.DATETIME_TO != '' && order.DATETIME_TO != undefined) {
                order.DATETIME_TO = this.utils.dateToddMMyyyy(new Date(order.DATETIME_TO), '/');
            }
        }
    }

    //Funcion que retorna el nombre del Solicitante
    public getRequestorName(dataPartners): string {
        let name = "";

        for (let data of dataPartners) {
            if (data.PARTNER_FCT == "00000001") {
                name = data.FULLNAME;
                break;
            }
        }

        return name;
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

    public setUserLogged(user: Partner) {
        this.userLogged = user;
    }

    public getUserLogged(): Partner {
        return this.userLogged;
    }

    //Funcion que calcula el numero de ordenes que entran en la pantalla, y las muestra
    public setMaxHeight(height: number, width: number, filter, cdRef?) {
        let rows = Math.floor(height / 137);
        let cols = width < 494 ? 1 : width < 705 ? 2 : width < 880 ? 3 : 4;
        this.pageSize = rows * cols;

        if (cdRef != null)
            this.cdRef = cdRef;

        this.rangeFilter = filter;
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredOpportunities <= this.TotalOfLoadedOpportunities && this.totalOfFilteredSales <= this.TotalOfLoadedSales) {
                this.setCurrentFilteredOpportunitiesPages(0);
                this.setCurrentFilteredSalesPages(0);
            } else {
                if (this.currentOpportunityFilteredPaginationNumber == 0 && this.currentSaleFilteredPaginationNumber == 0) {
                    this.setCurrentFilteredOpportunitiesPages(0);
                    this.setCurrentFilteredSalesPages(0);
                } else {
                    this.currentOpportunityFilteredPaginationNumber = 0;
                    this.currentSaleFilteredPaginationNumber = 0;
                    this.loadFilteredOrders(filter, 0, 0);
                }
            }
        }
        else if (this.operations.length <= 0 || this.states.length <= 0) {
            this.loadAllData();
        } else if (this.opportunityOrders.length <= 0 || this.saleOrders.length <= 0) {
            this.loadTotalOfOrders();
            this.loadOrders(0, 0);
        } else {
            this.totalOfOpportunities = this.totalOfOpportunitiesUnchanged;
            this.totalOfSales = this.totalOfSalesUnchanged;
            if (this.currentOpportunityPaginationNumber == 0 && this.currentSalePaginationNumber == 0) {
                this.setCurrentOpportunitiesPages(0);
                this.setCurrentSalesPages(0);
            } else {
                this.currentOpportunityPaginationNumber = 0;
                this.currentSalePaginationNumber = 0;
                this.loadOrders(0, 0);
            }
        }
    }

    //Funcion que cambia la pagina de Oportunidades
    public setCurrentOpportunitiesPages(page: number) {
        this.calculateMaximumOfOpportunities();

        this.actualPageOpportunity = [];

        if (page != null)
            this.currentPageOpportunity = page;

        for (let i = this.currentPageOpportunity % (this.TotalOfLoadedOpportunities / this.pageSize) * this.pageSize; i < (this.currentPageOpportunity % (this.TotalOfLoadedOpportunities / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.opportunityOrders.length) {
                break;
            }
            this.actualPageOpportunity.push(this.opportunityOrders[i]);
        }

        this.loadingOpportunities = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }
    }

    //Funcion que cambia la pagina de Oportunidades, manteniendo el filtrado
    public setCurrentFilteredOpportunitiesPages(page: number) {
        this.totalOfOpportunities = this.totalOfFilteredOpportunities;
        this.calculateMaximumOfOpportunities();

        this.actualPageOpportunity = [];

        if (page != null)
            this.currentPageOpportunity = page;

        for (let i = this.currentPageOpportunity % (this.TotalOfLoadedOpportunities / this.pageSize) * this.pageSize; i < (this.currentPageOpportunity % (this.TotalOfLoadedOpportunities / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.opportunityOrdersFiltered.length) {
                break;
            }
            this.actualPageOpportunity.push(this.opportunityOrdersFiltered[i]);
        }

        this.loadingOpportunities = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }
    }

    //Funcion que realiza el filtrado de Oportunidades
    setFilterOpportunity(filter) {
        this.opportunityOrdersFiltered = [];
        
        if (filter.search == "" && !filter.stateOpen && !filter.stateProcessing && !filter.stateClose) {
            this.totalOfOpportunities = this.totalOfOpportunitiesUnchanged;
            if (this.currentOpportunityPaginationNumber == 0) {
                this.totalOfOpportunities = this.totalOfOpportunitiesUnchanged;
                this.setCurrentOpportunitiesPages(0);
            } else {
                this.totalOfOpportunities = this.totalOfOpportunitiesUnchanged;
                this.currentOpportunityPaginationNumber = 0;
                this.loadOpportunityOrders(0).then(
                    () => this.setCurrentOpportunitiesPages(0)
                );
            }
            return;
        }

        if (this.totalOfOpportunitiesUnchanged <= this.TotalOfLoadedOpportunities) {
            this.pageOpportunityFilteredLoadedFrom = 0;
            this.pageOpportunityFilteredDistanceCovered = this.pageOpportunityDistanceCovered;
            this.pageOpportunityFilteredLoadedTo = this.pageOpportunityLoadedTo;
            this.loadDataFiltered("opportunity", filter);
        } else {
            this.currentOpportunityFilteredPaginationNumber = 0;
            this.loadTotalOfFilteredOpportunities(filter);
            this.loadFilteredOpportunityOrders(filter, 0).then(
                () => this.setCurrentFilteredOpportunitiesPages(0)
            );
        }
    }

    //Funcion que cambia la pagina de Ordenes de venta
    public setCurrentSalesPages(page: number) {
        this.calculateMaximumOfSales();

        this.actualPageSale = [];

        if (page != null)
            this.currentPageSale = page;

        for (let i = this.currentPageSale % (this.TotalOfLoadedSales / this.pageSize) * this.pageSize; i < (this.currentPageSale % (this.TotalOfLoadedSales / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.saleOrders.length) {
                break;
            }
            this.actualPageSale.push(this.saleOrders[i]);
        }

        this.loadingSales = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }
    }

    //Funcion que cambia la pagina de Ordenes de venta, manteniendo el filtrado
    public setCurrentFilteredSalesPages(page: number) {
        this.totalOfSales = this.totalOfFilteredSales;
        this.calculateMaximumOfSales();

        this.actualPageSale = [];

        if (page != null)
            this.currentPageSale = page;

        for (let i = this.currentPageSale % (this.TotalOfLoadedSales / this.pageSize) * this.pageSize; i < (this.currentPageSale % (this.TotalOfLoadedSales / this.pageSize) + 1) * this.pageSize; i++) {
            if (i >= this.saleOrdersFiltered.length) {
                break;
            }
            this.actualPageSale.push(this.saleOrdersFiltered[i]);
        }

        this.loadingSales = false;

        if (this.cdRef != null) {
            try {
                this.cdRef.detectChanges();
            } catch (e) { }
        }
    }

    //Funcion que realiza el filtrado de Ordenes de venta
    setFilterSale(filter) {
        this.saleOrdersFiltered = [];
        
        if (filter.search == "" && !filter.stateOpen && !filter.stateProcessing && !filter.stateClose) {
            this.totalOfSales = this.totalOfSalesUnchanged;
            if (this.currentSalePaginationNumber == 0) {
                this.totalOfSales = this.totalOfSalesUnchanged;
                this.setCurrentSalesPages(0);
            } else {
                this.totalOfSales = this.totalOfSalesUnchanged;
                this.currentSalePaginationNumber = 0;
                this.loadSalesOrders(0).then(
                    () => this.setCurrentSalesPages(0)
                );
            }
            return;
        }

        if (this.totalOfSalesUnchanged <= this.TotalOfLoadedSales) {
            this.pageSaleFilteredLoadedFrom = 0;
            this.pageSaleFilteredDistanceCovered = this.pageSaleDistanceCovered;
            this.pageSaleFilteredLoadedTo = this.pageSaleLoadedTo;
            this.loadDataFiltered("sales", filter);
        } else {
            this.currentSaleFilteredPaginationNumber = 0;
            this.loadTotalOfFilteredSales(filter);
            this.loadFilteredSalesOrders(filter, 0).then(
                () => this.setCurrentFilteredSalesPages(0)
            );
        }
    }

    //Funcion que calcula el numero maximo de Oportunidades
    public calculateMaximumOfOpportunities() {
        this.maxPageOpportunities = this.totalOfOpportunities % this.pageSize == 0 ? this.totalOfOpportunities / this.pageSize - 1 : Math.floor(this.totalOfOpportunities / this.pageSize);
    }

    //Funcion que calcula el numero maximo de Ordenes de venta
    public calculateMaximumOfSales() {
        this.maxPageSales = this.totalOfSales % this.pageSize == 0 ? this.totalOfSales / this.pageSize - 1 : Math.floor(this.totalOfSales / this.pageSize);
    }

    //Funcion que calcula el total de Ordenes
    public calculateTotalOfOrders(withFilter: boolean): number {
        if (withFilter)
            return this.totalOfFilteredOrders = this.totalOfFilteredOpportunities + this.totalOfFilteredSales;
        else
            return this.totalOfOrders = this.totalOfOpportunities + this.totalOfSales;
    }

    //Funcion que retorna el numero que corresponde al filtro indicado
    public transformFilterToNum(filter): number {
        let numFilter: string = "";

        numFilter = filter.stateOpen ? '1' : '0';
        numFilter = numFilter + (filter.stateProcessing ? '1' : '0');
        numFilter = numFilter + (filter.stateClose ? '1' : '0');

        return parseInt(numFilter, 2);
    }

    //Funcion que muestra la anterior pagina de Oportunidades
    public moveToPreviousSlideOpportunity() {
        if (this.currentPageOpportunity == this.minPageOpportunities)
            return;
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredOpportunities <= this.TotalOfLoadedOpportunities)
                this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity - 1);
            else {
                if (this.currentPageOpportunity - 1 >= this.pageOpportunityFilteredLoadedFrom)
                    this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity - 1);
                else {
                    this.currentOpportunityFilteredPaginationNumber--;
                    this.loadFilteredOpportunityOrders(this.rangeFilter, this.currentOpportunityFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity - 1)
                    );
                }
            }
        } else {
            if (this.currentPageOpportunity - 1 >= this.pageOpportunityLoadedFrom)
                this.setCurrentOpportunitiesPages(this.currentPageOpportunity - 1);
            else {
                this.currentOpportunityPaginationNumber--;
                this.loadOpportunityOrders(this.currentOpportunityPaginationNumber).then(
                    () => this.setCurrentOpportunitiesPages(this.currentPageOpportunity - 1)
                );
            }
        }
    }

    //Funcion que muestra la siguiente pagina de Oportunidades
    public moveToNextSlideOpportunity() {
        if (this.currentPageOpportunity == this.maxPageOpportunities)
            return;
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredOpportunities <= this.TotalOfLoadedOpportunities)
                this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity + 1);
            else {
                if (this.currentPageOpportunity + 1 <= this.pageOpportunityFilteredLoadedTo)
                    this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity + 1);
                else {
                    this.currentOpportunityFilteredPaginationNumber++;
                    this.loadFilteredOpportunityOrders(this.rangeFilter, this.currentOpportunityFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredOpportunitiesPages(this.currentPageOpportunity + 1)
                    );
                }
            }
        } else {
            if (this.currentPageOpportunity + 1 <= this.pageOpportunityLoadedTo)
                this.setCurrentOpportunitiesPages(this.currentPageOpportunity + 1);
            else {
                this.currentOpportunityPaginationNumber++;
                this.loadOpportunityOrders(this.currentOpportunityPaginationNumber).then(
                    () => this.setCurrentOpportunitiesPages(this.currentPageOpportunity + 1)
                );
            }
        }
    }

    //Funcion que muestra la pagina de Oportunidades indicada por el rango
    public movePageRangeOpportunity(page: number) {
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredOpportunities <= this.TotalOfLoadedOpportunities)
                this.setCurrentFilteredOpportunitiesPages(page);
            else {
                if (page >= this.pageOpportunityFilteredLoadedFrom && page <= this.pageOpportunityFilteredLoadedTo)
                    this.setCurrentFilteredOpportunitiesPages(page);
                else {
                    this.currentOpportunityFilteredPaginationNumber = Math.floor(page / this.pageOpportunityFilteredDistanceCovered);
                    this.loadFilteredOpportunityOrders(this.rangeFilter, this.currentOpportunityFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredOpportunitiesPages(page)
                    );
                }
            }
        } else {
            if (page >= this.pageOpportunityLoadedFrom && page <= this.pageOpportunityLoadedTo)
                this.setCurrentOpportunitiesPages(page);
            else {
                this.currentOpportunityPaginationNumber = Math.floor(page / this.pageOpportunityDistanceCovered);
                this.loadOpportunityOrders(this.currentOpportunityPaginationNumber).then(
                    () => this.setCurrentOpportunitiesPages(page)
                );
            }
        }
    }

    //Funcion que muestra la anterior pagina de Ordenes de venta
    public moveToPreviousSlideSale() {
        if (this.currentPageSale == this.minPageSales)
            return;
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredSales <= this.TotalOfLoadedSales)
                this.setCurrentFilteredSalesPages(this.currentPageSale - 1);
            else {
                if (this.currentPageSale - 1 >= this.pageSaleFilteredLoadedFrom)
                    this.setCurrentFilteredSalesPages(this.currentPageSale - 1);
                else {
                    this.currentSaleFilteredPaginationNumber--;
                    this.loadFilteredSalesOrders(this.rangeFilter, this.currentSaleFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredSalesPages(this.currentPageSale - 1)
                    );            }
            }
        } else {
            if (this.currentPageSale - 1 >= this.pageSaleLoadedFrom)
                this.setCurrentSalesPages(this.currentPageSale - 1);
            else {
                this.currentSalePaginationNumber--;
                this.loadSalesOrders(this.currentSalePaginationNumber).then(
                    () => this.setCurrentSalesPages(this.currentPageSale - 1)
                );
            }
        }
    }

    //Funcion que muestra la siguiente pagina de Ordenes de venta
    public moveToNextSlideSale() {
        if (this.currentPageSale == this.maxPageSales)
            return;
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredSales <= this.TotalOfLoadedSales)
                this.setCurrentFilteredSalesPages(this.currentPageSale + 1);
            else {
                if (this.currentPageSale + 1 <= this.pageSaleFilteredLoadedTo)
                    this.setCurrentFilteredSalesPages(this.currentPageSale + 1);
                else {
                    this.currentSaleFilteredPaginationNumber++;
                    this.loadFilteredSalesOrders(this.rangeFilter, this.currentSaleFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredSalesPages(this.currentPageSale + 1)
                    );
                }
            }
        } else {
            if (this.currentPageSale + 1 <= this.pageSaleLoadedTo)
                this.setCurrentSalesPages(this.currentPageSale + 1);
            else {
                this.currentSalePaginationNumber++;
                this.loadSalesOrders(this.currentSalePaginationNumber).then(
                    () => this.setCurrentSalesPages(this.currentPageSale + 1)
                );
            }
        }
    }

    //Funcion que muestra la pagina de Ordenes de venta indicada por el rango
    public movePageRangeSale(page: number) {
        if (this.rangeFilter.has) {
            if (this.totalOfFilteredSales <= this.TotalOfLoadedSales)
                this.setCurrentFilteredSalesPages(page);
            else {
                if (page >= this.pageSaleFilteredLoadedFrom && page <= this.pageOpportunityFilteredLoadedTo)
                    this.setCurrentFilteredSalesPages(page);
                else {
                    this.currentSaleFilteredPaginationNumber = Math.floor(page / this.pageSaleFilteredDistanceCovered);
                    this.loadFilteredSalesOrders(this.rangeFilter, this.currentSaleFilteredPaginationNumber).then(
                        () => this.setCurrentFilteredSalesPages(page)
                    );
                }
            }
        } else {
            if (page >= this.pageSaleLoadedFrom && page <= this.pageSaleLoadedTo)
                this.setCurrentSalesPages(page);
            else {
                this.currentSalePaginationNumber = Math.floor(page / this.pageSaleDistanceCovered);
                this.loadSalesOrders(this.currentSalePaginationNumber).then(
                    () => this.setCurrentSalesPages(page)
                );
            }
        }
    }
}