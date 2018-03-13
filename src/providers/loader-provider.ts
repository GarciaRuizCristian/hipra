import { Loading, LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate/src/translate.service';

@Injectable()
export class LoaderProvider {

    private stackCount = 0;

    private loader: Loading;

    constructor(private loadingCtrl: LoadingController, private translate: TranslateService) {

    }

    public pushLoadingProcessCallback(message?: string) {
        this.stackCount++;

        if(this.stackCount == 1) {
            if (message == null) {
                this.translate.get('WaitPlease').subscribe(waitPlease => {
                    this.loader = this.loadingCtrl.create({ content: waitPlease});
                });
            }
            else
                this.loader = this.loadingCtrl.create({ content: message });
            return this.loader.present();
        }
    }

    public pushLoadingProcess(message?: string): void {
        this.stackCount++;

        if(this.stackCount == 1) {
            if (message == null) {
                this.translate.get('WaitPlease').subscribe(waitPlease => {
                    this.loader = this.loadingCtrl.create({ content: waitPlease});
                });
            }
            else
                this.loader = this.loadingCtrl.create({ content: message });
            this.loader.present();
        }
    }

    public popLoadingProcess(): void {
        this.stackCount--;

        if (this.stackCount == 0) {
            this.loader.dismiss();
        }
    }

    public getLoadingProcesses(): number {
        return this.stackCount;
    }
}