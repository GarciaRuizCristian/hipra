import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';

enum AlertLevel {
    Verbose = 0,
    Debug = 1,
    Production = 2
}

const APP_ALERT_LEVEL: AlertLevel = AlertLevel.Production;

function DefineAlertLevel(value: AlertLevel) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (value < APP_ALERT_LEVEL)
            descriptor.value = () => { };
    }
}

@Injectable()
export class AlertProvider {

    constructor(
        private alertCtrl: AlertController
    ) { }

    @DefineAlertLevel(AlertLevel.Verbose)
    public presentVerboseMessage(message: string) {
        // this.alertCtrl.create({
        //     title: 'Verbose Message',
        //     message: message,
        //     buttons: ['OK!']
        // }).present();
        alert(message);
    }

    @DefineAlertLevel(AlertLevel.Debug)
    public presentDebugMessage(message: string) {
        this.alertCtrl.create({
            title: 'Debug Message',
            message: message,
            buttons: ['OK!']
        }).present();
    }

    @DefineAlertLevel(AlertLevel.Production)
    public presentProductionMessage(message: string) {
        // this.alertCtrl.create({
        //     title: 'Production Message',
        //     message: message,
        //     buttons: ['OK!']
        // }).present();
        alert(message);
    }

    @DefineAlertLevel(AlertLevel.Production)
    public presentDeleteSpecieMessage(title: string, message: string, affirmativeAnswer: string, negativeAnswer: string) {
        return new Promise((resolve, reject) => {
            this.alertCtrl.create({
                title: title,
                message: message,
                buttons: [
                    {
                        text: affirmativeAnswer,
                        handler: () => resolve(true)                        
                    }, {
                        text: negativeAnswer,
                        handler: () => resolve(false),
                        role: 'cancel'
                    }
                ],
                enableBackdropDismiss: false
            }).present();
        })

    }

    @DefineAlertLevel(AlertLevel.Production)
    public presentUserPasswordEmptyError(title, message){
        this.alertCtrl.create({
            title: title,
            message: message,
            buttons: ['OK']
        }).present();
    }

}
