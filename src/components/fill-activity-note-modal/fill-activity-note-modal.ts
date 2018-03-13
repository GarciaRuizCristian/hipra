import { SelectSearchModal } from '../select-search/select-search-modal';
import { ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/src/translate.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TextActClasses } from '../../models/textActClasses';
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';


@Component({
    selector: 'fill-activity-note-modal',
    templateUrl: 'fill-activity-note-modal.html',
})
export class FillActivityNoteModal {

    noteContent: string = "";
    noteTypeId: string = "";
    noteTypeLabel: string = "";
    noteTypes: Array<TextActClasses> = [];

    form: FormGroup;

    constructor(
        private params: NavParams, 
        private viewCtrl: ViewController, 
        private translate: TranslateService, 
        private alertCtrl: AlertController,
        private modalCtrl: ModalController        
    ) {
        this.noteTypes = params.get("noteTypes");
        let content = params.get("content");
        if(content != null)
            this.noteContent = content;
        else
            this.noteContent = "";

        let type = params.get("type");
        this.noteTypeId = "";
        this.noteTypeLabel = "";
        if(type != null){
            for( let note of this.noteTypes){
                if(note.TDID == type){
                    this.noteTypeId = note.TDID;
                    this.noteTypeLabel = note.TDTEXT;
                    break;
                }
            }
        }

        this.form = new FormGroup({
            noteType: new FormControl({ value: '' }, Validators.compose([Validators.required])),            
            noteContent: new FormControl({ value: '' }, Validators.compose([Validators.required])),
        });
    }

    selectNoteType() {
        this.translate.get("SelectNoteType").toPromise().then(translatedNoteType => {
            let partnerModal = this.modalCtrl.create(SelectSearchModal, {
                val: this.noteTypeId,
                options: this.noteTypes,
                key: "TDID",
                label: "TDTEXT",
                showKey: false,
                title: translatedNoteType,
            }, {
                enableBackdropDismiss: false
            });

            partnerModal.onDidDismiss(index => {
                if(index != null)
                    for (let type of this.noteTypes) {
                        if (type.TDID == this.noteTypes[index].TDID) {
                            this.noteTypeId = type.TDID;
                            this.noteTypeLabel = type.TDTEXT;
                            break;
                        }
                    }
            });
            partnerModal.present();
        })
    }

    dismiss(action) {
        this.viewCtrl.dismiss();
    }

    saveNote() {
        if (this.isFormValid())
            this.viewCtrl.dismiss({content: this.noteContent, type:this.noteTypeId});
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
