import { SelectSearchModalWeb } from '../select-search/select-search-modal-web';
import { ModalController } from 'ionic-angular';
import { PartnerAbstract } from '../../models/partnerAbstract';
import { ReTypes } from '../../models/reTypes';
import { AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TextActClasses } from '../../models/textActClasses';
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { PartnersWebProvider } from "../../providers/partners-web-provider";
import { PartnerAbstractWeb } from "../../models/partnerAbstractWeb";


@Component({
    selector: 'select-relation-modal',
    templateUrl: 'select-relation-modal.html',
})
export class SelectRelationModal {

    totalOfRelationPartners: number = 0;
    typePartner: string;
    relationPartners: Array<PartnerAbstractWeb> = [];
    relationTypes: Array<ReTypes> = [];
    previousRelation;

    selectedRelationType: ReTypes;
    selectedRelationPartner: {NAME: string, PARTNER: string};

    selectedRelationTypeName: string = "";
    selectedRelationPartnerName: string = "";

    form: FormGroup;

    loadingRelations = false;


    constructor(
        private params: NavParams,
        private viewCtrl: ViewController,
        private translate: TranslateService,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private partnersWebProvider: PartnersWebProvider
    ) {
        this.relationTypes = params.get("relationTypes");
        this.previousRelation = params.get("previousRelation");
        
        if (this.previousRelation != null) {
            this.loadingRelations = true;
            for (let type of this.relationTypes)
                if (type.RELTYP == this.previousRelation.RELATIONSHIPCATEGORY) {
                    this.selectedRelationType = type;
                    this.selectedRelationTypeName = type.BEZ50;
                    if (type.RELTYP == "BUR001") {
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_CONTACT_PERSON;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_CONTACT_PERSON, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                    else if (type.RELTYP == "ZVET01") {
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_PRESCRIPTOR;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_PRESCRIPTOR, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                    else {
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                    break;
                }
                this.selectedRelationPartner = {
                    NAME: this.previousRelation.NAME,
                    PARTNER: this.previousRelation.PARTNER2
                };
                this.selectedRelationPartnerName = this.previousRelation.NAME;
        }

        this.form = new FormGroup({
            partner: new FormControl({ value: '' }, Validators.compose([Validators.required])),
            relation: new FormControl({ value: '' }, Validators.compose([Validators.required])),
        });
    }

    selectRelationPartner() {
        if (this.selectedRelationTypeName == "") {
            this.translate.get("NoRelationSelected").toPromise().then(
                title => {
                    this.translate.get("NoRelationSelectedMessage").toPromise().then(message => {
                        let alert = this.alertCtrl.create({
                            title: title,
                            message: message,
                            buttons: ["OK"]
                        }).present();
                    })
                }
            )
        }
        else {
            this.translate.get("SelectPartner").toPromise().then(translatedTitle => {
                let partnerModal = this.modalCtrl.create(SelectSearchModalWeb, {
                    val: this.selectedRelationPartner != null ? this.selectedRelationPartner.PARTNER : null,
                    options: this.relationPartners,
                    maxOptions: this.totalOfRelationPartners,
                    typeOption: this.typePartner,
                    key: "PARTNER",
                    label: "NAME",
                    showKey: false,
                    title: translatedTitle,
                }, {
                    enableBackdropDismiss: false
                });

                partnerModal.onDidDismiss(partner => {
                    if (partner != null) {
                        this.selectedRelationPartner = partner;
                        this.selectedRelationPartnerName = partner.NAME;
                    }
                });
                partnerModal.present();
            })
        }
    }

    selectRelationType() {
        let lastRelation = this.selectedRelationType == null ? null : this.selectedRelationType.RELTYP ;
        this.translate.get("SelectRelation").toPromise().then(translatedRelation => {
            let relationModal = this.modalCtrl.create(SelectSearchModalWeb, {
                val: this.selectedRelationType != null ? this.selectedRelationType.RELTYP : null,
                options: this.relationTypes,
                key: "RELTYP",
                label: "BEZ50",
                showKey: false,
                title: translatedRelation,
            }, {
                enableBackdropDismiss: false
            });

            relationModal.onDidDismiss(type => {
                if (type != null) {
                    this.loadingRelations = true;
                    this.selectedRelationType = type;
                    this.selectedRelationTypeName = type.BEZ50;
                    if (type.RELTYP == "BUR001") {
                        if(lastRelation != "BUR001"){
                            this.selectedRelationPartner = null;
                            this.selectedRelationPartnerName = "";
                        }
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_CONTACT_PERSON;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_CONTACT_PERSON, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                    else if (type.RELTYP == "ZVET01") {
                        if(lastRelation != "ZVET01"){
                            this.selectedRelationPartner = null;
                            this.selectedRelationPartnerName = "";
                        }
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_PRESCRIPTOR;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_PRESCRIPTOR, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                    else {
                        if(lastRelation == "BUR001" || lastRelation == "ZVET01"){
                            this.selectedRelationPartner = null;
                            this.selectedRelationPartnerName = "";
                        }
                        this.typePartner = PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR;
                        this.partnersWebProvider.loadPartners(1, PartnersWebProvider.PAGE_SIZE, PartnersWebProvider.PARTNERS_NO_YE_NO_CONTACT_PERSON_NO_PRESCRIPTOR, '').then((partners) => {
                            this.totalOfRelationPartners = Number(partners.MAX_PARTNERS);
                            this.relationPartners = partners.PARTNERS;
                            this.loadingRelations = false;
                        });
                    }
                }
            });
            relationModal.present();
        })
    }

    dismiss(action) {
        this.viewCtrl.dismiss();
    }

    saveRelation() {
        if (this.isFormValid())
            this.viewCtrl.dismiss({ partner: this.selectedRelationPartner, relation: this.selectedRelationType });
        else {
            this.translate.get('form').subscribe(
                form => {
                    this.translate.get('Agree').subscribe(
                        agree => {
                            this.translate.get('checkRedFields').subscribe(
                                redfields => {
                                    let alert = this.alertCtrl.create({
                                        title: form,
                                        message: redfields,
                                        buttons: [agree]
                                    });
                                    alert.present();
                                });
                        });
                });
        }
    }

    isFormValid() {
        Object.keys(this.form.controls).forEach(key => {
            this.form.get(key).markAsTouched();
        });

        return this.form.valid;
    }

}