import { Component } from "@angular/core";
import { QueueProvider } from "../../providers/queue-provider";
import { NavController } from "ionic-angular/navigation/nav-controller";
import { ContactPage } from "../contact/contact";
import { ActivityPage } from "../activity/activity";
import { OrderPage } from "../order/order";
import { SyncProvider } from "../../providers/sync-provider";


@Component({
    selector: 'page-queue',
    templateUrl: 'queue.html'
})
export class QueuePage {

    public tasks = [];
    public pendingSync = false;
    public doingSync = false;

    constructor(
        private queueProvider: QueueProvider,
        private navCtrl: NavController,
        private syncProvider: SyncProvider
    ) {
        this.syncProvider.pendingEmitter.subscribe((pending) => this.pendingSync = pending);
        this.syncProvider.doingEmitter.subscribe((doing) => this.doingSync = doing);
    }

    ionViewDidLoad() {
        this.tasks = this.queueProvider.tasks != null ? this.queueProvider.tasks : [];
    }

    getType(task): string {
        if (task.data[0].PARTNER != null)
            return "Partner";
        if (task.data[0].HEADER.PROCESS_TYPE == "Z014")
            return "SalesOrd";
        if (task.data[0].HEADER.PROCESS_TYPE == "Z007")
            return "Opportunity";
        return "Activity";
    }

    getError(task): string {
        if (task.hasErrors) {
            return "SapError";
        }
        return "ConnectionError";
    }

    openTask(task) {
    if (this.doingSync)
        return;

        let task_type = this.getType(task);
        if (task_type == "Partner")
            this.navCtrl.push(ContactPage, {
                full: task.data[0]
            });
        else if (task_type == "Activity") {
            this.navCtrl.push(ActivityPage, {
                full: task.data[0]
            });
        } else {
            this.navCtrl.push(OrderPage, {
                full: task.data[0]
            });
        }
    }

    clearQueue() {
        if (this.doingSync)
            return;

        this.queueProvider.clear().then(() => {
            this.tasks = this.queueProvider.tasks != null ? this.queueProvider.tasks : []
        });
    }

    clearTask(task) {
        if (this.doingSync)
            return;

        this.queueProvider.clearTask(task).then(() => {
            this.tasks = this.queueProvider.tasks != null ? this.queueProvider.tasks : []
        });
    }

    sendTask(task): Promise<void> {
        if (this.doingSync)
            return Promise.resolve();

        let end = () => {
            this.tasks = this.queueProvider.tasks != null ? this.queueProvider.tasks : [];
        };

        return this.syncProvider.sync(false, true, task)
            .then(end)
            .catch(end);
    }

    refresh(): Promise<void> {
        if (this.doingSync)
            return Promise.resolve();

        let end = () => {
            this.tasks = this.queueProvider.tasks != null ? this.queueProvider.tasks : [];
        };

        return this.syncProvider.sync(false, true)
            .then(end)
            .catch(end);
    }

}