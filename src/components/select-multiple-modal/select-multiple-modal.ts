import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { ProductAbstract } from '../../models/productAbstract';
import { SapcrmProvider } from '../../providers/sapcrm-provider';

@Component({
  selector: 'select-multiple-modal',
  templateUrl: 'select-multiple-modal.html'
})
export class SelectMultipleModal implements OnInit {
  val: any[] = [];
  options: {label: string, value:any}[] = [];
  data: any[];
  copiaData: any[];
  /*
  optionsByQueryFn?: Function;
  */
  key: string = "key";
  label: string = "label";

  showKey: string = "true";
  title: string;

  loadingCount: number = 0;
  loaded = false;
  filter: string;
  searchQuery: string = "";
  filtered = {
    options: []
  };
  constructor(public cdRef: ChangeDetectorRef, public viewCtrl: ViewController, params: NavParams, public sapcrmProvider: SapcrmProvider) {
    /*
    this.optionsByQueryFn = params.get("optionsByQueryFn");
    */
    this.key = params.get("key");
    this.label = params.get("label");
    
    this.showKey = params.get("showKey");
    this.title = params.get("title");
    this.data = params.get("data");
    this.copiaData = this.data;

    this.filtered.options = this.options;
  
  }

  editValue(value: any) {//TODO
    let index = this.val.indexOf(value);
    if (index > -1) {//Check if we already have it
      this.val.splice(index, 1);
    } else {
      this.val.push(value);
    }
  }

  dismiss(action) {
    if (this.loaded) {
      if (action == 'apply') {
        console.log("dismiss with val: " + this.val);
        this.viewCtrl.dismiss(this.val);
      } else if (action == 'cancel') {
        console.log("dismiss without val:");
        this.viewCtrl.dismiss();
      }
    }
  }

  ngOnInit() {
    //this.searchControl.valueChanges.debounceTime(300).subscribe(search => {
    //   this.searching = false;
    /*
    this.setFilteredOptions();
    */
    //});   
    setTimeout(() =>
      this.loaded = true
      , 300);
  }

  search(q) {
    console.log(q);       
   
    this.filter=  q.target.value;
    /*
    console.log(q);
    if (q.keyCode == 13) {
      console.log("Este es el código del input: " + q.keyCode);
      this.viewCtrl.dismiss(this.filter);
    }
    */
  }

  onSearchInput(q) {
    console.log(q);         
    this.filter=  q.target.value;
    let whereClause = "";
    let whereValues = [];
    if (this.key=="PARTNER") {     
      whereClause += "NAME LIKE ?";
      whereValues.push("%"+this.filter.toUpperCase()+"%");    
      this.getPartnersByQuery(whereClause,whereValues,0,"NAME").then((options: any[]) => {   
        this.filtered.options = options;
        this.hideLoading();
        try {
         this.cdRef.detectChanges();
        } catch (err) {
          console.log("error en el detectChanges");
        }
      }).catch((err) => console.log(err));
    }
    if (this.key=="IDMATERIAL") {
      if (typeof this.filter == "undefined") {
        this.data = this.copiaData;
      } else {
        this.data = [];
        for (let product of this.copiaData) {
          if (String(product.MATERIAL.toUpperCase()).includes(this.filter.toUpperCase())) {
            this.data.push(product);
          }
        }
      }
    }
    
  }

  setFilteredOptions() {
    if (this.key=="PARTNER") {
      this.getPartnersByQuery(undefined,undefined,undefined,"NAME").then((options: any[]) => {   
        this.filtered.options = options;
        this.hideLoading();
        try {
         this.cdRef.detectChanges();
        } catch (err) {
          console.log("error en el detectChanges");
        }
      }).catch((err) => console.log(err));
    }
    if (this.key=="IDMATERIAL") {
      this.getProductsByQuery("",[],0,"MATERIAL").then((options: any[]) => {   
        this.filtered.options = options;
        this.hideLoading();
        try {
         this.cdRef.detectChanges();
        } catch (err) {
          console.log("error en el detectChanges");
        }
      }).catch((err) => console.log(err));
    }
      
  }

  /*
  tryFilterOptionsByQuery() {
    if (this.timeoutFilterOptionsByQuery) {
      clearTimeout(this.timeoutFilterOptionsByQuery);
      this.timeoutFilterOptionsByQuery = undefined;
    } else {
      this.showLoading();
    }   
    this.timeoutFilterOptionsByQuery = setTimeout(this.setFilteredOptionsByQuery, 1000);
    */  
   /*
  setFilteredOptionsByQuery = () => {
    this.timeoutFilterOptionsByQuery = undefined;
    this.optionsByQueryFn(this.searchQuery, 0).then((options: any[]) => {

      if (options.length > 0 && options[0].ADDRESS != undefined) { // es un PartnerABSTRACT ordenar por partner
        //order by NAME
        options.sort(function (a, b) {
          if (a.NAME != undefined) {
            return a.NAME.toUpperCase().localeCompare(b.NAME.toUpperCase());
          }
        });
      }
      if (options.length > 0 && options[0].IDMATERIAL != undefined) { // es un productoABSTRACT ordenar por partner
        //order by MATERIAL
        options.sort(function (a, b) {
          if (a.MATERIAL != undefined) {
            return a.MATERIAL.toUpperCase().localeCompare(b.MATERIAL.toUpperCase());
          }
        });
      }

      this.filtered.options = options;
      this.hideLoading();
      try {
        this.cdRef.detectChanges();
      } catch (err) {
        console.log("error en el detectChanges");
      }
    }).catch((err) => console.log(err));
  }
  */

  getPartnersByQuery = (whereClause?:string, whereValues?: any[], page?: number, orderBy?: string): Promise<PartnerAbstract[]> => {//Cargamos todos
    return this.sapcrmProvider.getPartnerAbstracts(whereClause,whereValues,undefined,undefined, "NAME");
    /*
    return this.sapcrmProvider.getPartnerAbstracts(undefined, undefined, (partner: Partner) => {
      if (queryString) {
        if (
          (!partner.CENTRAL_ORGAN.NAME1 || partner.CENTRAL_ORGAN.NAME1.toUpperCase().indexOf(queryString.toUpperCase()) == -1)
          && (!partner.PARTNER || partner.PARTNER.toUpperCase().indexOf(queryString.toUpperCase()) == -1)
          && (!partner.DATA_ADDRESS.STR_SUPPL1 || partner.DATA_ADDRESS.STR_SUPPL1.toUpperCase().indexOf(queryString.toUpperCase()) == -1)
        ) {
          return false;
        }
      }
      return true;
    }, page, 50);
    */
  }

   getProductsByQuery = (whereClause?:string, whereValues?: any[], page?: number, orderBy?: string): Promise<ProductAbstract[]> => {//Cargamos todos
    return this.sapcrmProvider.getProductsAbstracts(whereClause,whereValues,page,50);
    /*
    return this.sapcrmProvider.getProductsAbstracts(undefined, undefined, (product: Product) => {
      if (queryString) {
        if (
          (!product.MATERIAL || product.MATERIAL.toUpperCase().indexOf(queryString.toUpperCase()) == -1)//Comporamos por descripcion
          && (!product.IDMATERIAL || product.IDMATERIAL.toUpperCase().indexOf(queryString.toUpperCase()) == -1)//Comparamos por ID
        ) {
          return false;
        }
      }
      return true;
    }, page, 50);
    */
  }


  showLoading(message?: string): void {
    this.loadingCount++;
  }

  hideLoading(): void {
    this.loadingCount--;
  }
}