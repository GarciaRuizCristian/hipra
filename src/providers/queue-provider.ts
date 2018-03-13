import { Partner } from '../models/partner';
import { EventEmitter, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { SapcrmProvider } from '../providers/sapcrm-provider';
import { UtilsProvider } from '../providers/utils-provider';
import { Activity } from '../models/activity';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

@Injectable()
export class QueueProvider {
  private STORAGE_KEY = "QueueProvider.TASKS";
  private running = false;
  private pending = false;
  public pendingEmitter: EventEmitter<any> = new EventEmitter<any>();
  public tasks = [];

  constructor(private storage: Storage, private utils: UtilsProvider, private sapcrmProvider: SapcrmProvider) {
    this.getList().then((tasks: QueueTask[]) => {
      this.pending = tasks.length != 0;
      this.pendingEmitter.emit(this.pending);
    });
  }

  public existTaskInQueue(tarea: QueueTask, tasks: QueueTask[]): number {
    let tipoTarea: string;
    let indice = -1;

    for (let task of tasks) {
      switch (this.getTypeTask(tarea)) {
        case "Partner":
          tasks.forEach((task, index) => {
            tipoTarea = this.getTypeTask(task);
            if (tipoTarea == "Partner" &&
            task.data[0].PARTNER == tarea.data[0].PARTNER)
              indice = index;
          });
          break;
        case "SalesOrd":
        case "Opportunity":
        case "Activity":
          tasks.forEach((task, index) => {
            tipoTarea = this.getTypeTask(task);
            if ((tipoTarea == "SalesOrd" || tipoTarea == "Opportunity" || tipoTarea == "Activity") && 
            task.data[0].HEADER.OBJECT_ID == tarea.data[0].HEADER.OBJECT_ID)
              indice = index;
          });
          break;
      }
    }

    return indice;
  }

  public add(providerName: string, sendMethod: string, successMethod: string, failureMethod: string, data: any[]): Promise<any> {
    return this.addToQueue({
      providerName: providerName,
      sendMethod: sendMethod,
      successMethod: successMethod,
      failureMethod: failureMethod,
      data: data,
      hasErrors: false 
    });
  }

  public clear = (): Promise<any> => {
    return this.getList().then((tasks: QueueTask[]) => {
      if (tasks.length == 0) {
        console.log("queue clear finished");
        this.running = false;
      } else {
        console.log("queue cleanning... there are " + tasks.length + " tasks in queue");
        var task: QueueTask = tasks[0];
        console.log("Clean queue task: " + JSON.stringify(task));
        return eval("_this." + task.failureMethod).apply(this, ["Canceled"].concat(task.data))
          .then((retry: boolean) => {
            if (retry) {
              console.log("queue clean error. retry in other moment");
              this.running = false;
              return new Promise<void>((resolve, reject) => reject("Clean canceled"));
            } else {
              return this.removeFirstFromQueue().then(this.clear);
            }
          });
      }
    });
  }

  public clearTask = (tarea: QueueTask): Promise<any> => {
    return this.getList().then((tasks: QueueTask[]) => {
      let tipoTarea: string;
      let indice: number = -1;

      return eval("_this." + tarea.failureMethod).apply(this, ["Canceled"].concat(tarea.data)).then(
        (retry: boolean) => {
          if (retry) {
            console.log("queue clean error. retry in other moment");
            this.running = false;
            return new Promise<void>((resolve, reject) => reject("Clean canceled"));
          } else {
            switch (this.getTypeTask(tarea)) {
              case "Partner":
                tasks.forEach((task, index) => {
                  tipoTarea = this.getTypeTask(task);
                  if (tipoTarea == "Partner" && 
                  task.data[0].PARTNER == tarea.data[0].PARTNER)
                    indice = index;
                });
                break;
              case "SalesOrd":
              case "Opportunity":
              case "Activity":
                tasks.forEach((task, index) => {
                  tipoTarea = this.getTypeTask(task);
                  if ((tipoTarea == "SalesOrd" || tipoTarea == "Opportunity" || tipoTarea == "Activity") && 
                  task.data[0].HEADER.OBJECT_ID == tarea.data[0].HEADER.OBJECT_ID)
                    indice = index;
                });
                break;
            }

            if (indice == -1) {
              console.log("queue clean error. task doesnt exist");
              this.running = false;
              return new Promise<void>((resolve, reject) => reject("Clean canceled"));
            } else {
              return this.removeTaskFromQueue(indice);
            }
          }
      });
    });
  }

  public addToQueue(tarea: QueueTask): Promise<any> {
    return this.getList().then((tasks: QueueTask[]) => {
      let indice = this.existTaskInQueue(tarea, tasks);

      if (indice == -1)
        tasks.push(tarea);
      else
        tasks.splice(indice, 1, tarea)
      return this.setList(tasks);
    });
  }

  public removeFirstFromQueue(): Promise<any> {
    return this.getList().then((tasks: QueueTask[]) => {
      tasks.shift();
      return this.setList(tasks);
    });
  }

  public removeTaskFromQueue(index: number): Promise<any> {
    return this.getList().then((tasks: QueueTask[]) => {
      tasks.splice(index, 1);
      return this.setList(tasks);
    });
  }

  public getTypeTask(task: QueueTask): string {
    if (task.data[0].PARTNER != null)
        return "Partner";
    if (task.data[0].HEADER.PROCESS_TYPE == "Z014")
        return "SalesOrd";
    if (task.data[0].HEADER.PROCESS_TYPE == "Z007")
        return "Opportunity";
    return "Activity";
}

  private getList(): Promise<QueueTask[]> {
    return this.storage.get(this.STORAGE_KEY).then((tasks: QueueTask[]) => {
      this.tasks = tasks;
      return tasks ? tasks : [];
    });
  }

  private setList(tasks: QueueTask[]): Promise<any> {
    this.pending = tasks.length != 0;
    this.pendingEmitter.emit(this.pending);
    return this.storage.set(this.STORAGE_KEY, tasks);
  }

  tryRun = (task?: QueueTask): Observable<number> => {
    if (!this.running) {
      console.log("Launching queue run()");
      if (task)
        return this.runOne(task);
      else
        return this.run();
    } else {
      console.log("Queue already running");
      return Observable.of(1);
    }
  }


  runOne = (tarea: QueueTask): Observable<number> => {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      this.getList().then((tasks: QueueTask[]) => {
        let indice = this.existTaskInQueue(tarea, tasks);

        if (indice == -1) {
          subscriber.complete();
        } else {
          return this.getList().then((tasks: QueueTask[]) => {
            console.log("Launching queue run task: " + JSON.stringify(tarea));
            var provider = this.getProvider(tarea.providerName)
            return eval("provider." + tarea.sendMethod).apply(provider, tarea.data).then(() => {
              console.log("Success on queue run task: " + JSON.stringify(tarea));
              return eval("_this." + tarea.successMethod).apply(this, tarea.data)
                .then(() => this.removeTaskFromQueue(indice))
            }).catch((error) => {
              console.log("Error '" + JSON.stringify(error) + "' on queue run task: " + JSON.stringify(tarea));
              let isConnectionError = this.utils.isConnectionError(error);
              this.utils.showToast(error);
              if (isConnectionError) {
                this.running = false;
                return new Promise<void>((resolve) => resolve());
              } else {
                tarea.hasErrors = true;
                this.running = false;
                return eval("_this." + tarea.failureMethod).apply(this, [error].concat(tarea.data))
                  .then((retry: boolean) => {
                    if (retry) {
                      console.log("queue run error. retry in other moment");
                      this.running = false;
                      return new Promise<void>((resolve) => resolve());
                    } else {
                      tarea.hasErrors = true;
                      this.running = false;
                      return new Promise<void>((resolve) => resolve());
                    }
                  });
              }
            }).then(() => {
              subscriber.next(1);
              subscriber.complete();
            });
          });
        }
      });
    })
  }

  run = (): Observable<number> => {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      this.getList().then((tasks: QueueTask[]) => {
        if (tasks.length == 0) {
          subscriber.complete();
        } else {
          this.runNext(tasks.length, subscriber)
            .then(() => {
              subscriber.next(1);
              subscriber.complete()
            });
        }
      });
    })
  }

  runNext(total: number, subscriber: Subscriber<number>): Promise<void> {
    return this.getList().then((tasks: QueueTask[]) => {
      subscriber.next((total - tasks.length) / total);
      if (tasks.length == 0) {
        console.log("queue run finished");
        this.running = false;
      } else {
        console.log("queue running... there are " + tasks.length + " tasks in queue");
        var task: QueueTask = tasks[0];
        console.log("Launching queue run task: " + JSON.stringify(task));
        var provider = this.getProvider(task.providerName)
        return eval("provider." + task.sendMethod).apply(provider, task.data).then(() => {
          console.log("Success on queue run task: " + JSON.stringify(task));
          return eval("_this." + task.successMethod).apply(this, task.data)
            .then(() => this.removeFirstFromQueue())
            .then(() => this.runNext(total, subscriber));
        }).catch((error) => {
          console.log("Error '" + JSON.stringify(error) + "' on queue run task: " + JSON.stringify(task));
          let isConnectionError = this.utils.isConnectionError(error);
          this.utils.showToast(error);
          if (isConnectionError) {
            this.running = false;
            return new Promise<void>((resolve) => resolve());
          } else {
            task.hasErrors = true;
            this.running = false;
            return eval("_this." + task.failureMethod).apply(this, [error].concat(task.data))
              .then((retry: boolean) => {
                if (retry) {
                  console.log("queue run error. retry in other moment");
                  this.running = false;
                  return new Promise<void>((resolve) => resolve());
                } else {
                  task.hasErrors = true;
                  this.running = false;
                  return new Promise<void>((resolve) => resolve());
                  // return this.removeFirstFromQueue()
                  //   .then(() => this.runNext(total, subscriber));
                }
              });
          }
        });
      }
    });
  }


  //DESDE AQUI Concreto de los providers de hipra ---------------------------------------------
  getProvider(providerName) {
    if (providerName == "SapcrmProvider") {
      return this.sapcrmProvider;
    }
  }

  pushPartner(newPartner: Partner): Promise<void> {
    if (newPartner.PARTNER.indexOf("-") != -1) { //Comprobamos que la actividad es nueva
      return this.deletePartnerFromQueue(newPartner).then(() => {
        this.add("SapcrmProvider", "sendPartner", "sendPartnerSuccess", "sendPartnerFailure", [newPartner, undefined]).then(() => {
          this.sapcrmProvider.updatePartner(newPartner);
        });
      });
    } else {
      return this.sapcrmProvider.getPartner(newPartner.PARTNER).then(
        (originalPartner: Partner) => {
          this.add("SapcrmProvider", "sendPartner", "sendPartnerSuccess", "sendPartnerFailure", [newPartner, originalPartner]);
      }).then(() => {
        this.sapcrmProvider.updatePartner(newPartner);
      });
    }
  }

  pushDeletePartner = (newPartner: Partner) => {
    console.log(newPartner);
    if (newPartner.PARTNER.indexOf("-") != -1) { //Modificación de una pendiente de enviar
      this.deletePartnerFromQueue(newPartner);
    } else {
      return this.sapcrmProvider.getPartner(newPartner.PARTNER)
        .then((originalPartner: Partner) => {
          this.add("SapcrmProvider", "sendPartner", "sendPartnerSuccess", "sendPartnerFailure", [newPartner, originalPartner]);
        })
        .then(() => {
          return this.sapcrmProvider.deletePartner(newPartner);
        });
    }
  }

  private deletePartnerFromQueue(newPartner: Partner): Promise<any> {
    return this.getList().then((tasks: QueueTask[]) => {
      for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].data[0].PARTNER == newPartner.PARTNER) {
          tasks.splice(i, 1);
          break;
        }
      }
      return this.setList(tasks);
    });
  }

  pushCreateActivity = (newActivity: Activity, isOrder: boolean) => {
    return this.add("SapcrmProvider", "sendActivity", "sendActivitySuccess", "sendActivityFailure", [newActivity, "pushCreateActivity", isOrder, undefined])
      .then(() => {
        return this.sapcrmProvider.updateActivity(newActivity);

      });
  }

  private deleteAcativityFromQueue(newActivity: Activity): Promise<any> {
    return this.getList().then((tasks: QueueTask[]) => {
      for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].data[0].HEADER.OBJECT_ID == newActivity.HEADER.OBJECT_ID) {
          tasks.splice(i, 1);
          break;
        }
      }
      return this.setList(tasks);
    });
  }


  pushChangeActivity = (newActivity: Activity, isOrder: boolean) => {
    console.log(newActivity);
    if (newActivity.HEADER.OBJECT_ID.indexOf("-") != -1) { //Modificación de una pendiente de enviar
      return this.deleteAcativityFromQueue(newActivity)
        .then(() => this.pushCreateActivity(newActivity, isOrder));
    } else {
      return this.sapcrmProvider.getActivity(newActivity.HEADER.OBJECT_ID)
        .then((originalActivity: Activity) => {
          this.add("SapcrmProvider", "sendActivity", "sendActivitySuccess", "sendActivityFailure", [newActivity, "pushChangeActivity", isOrder, originalActivity]);
        })
        .then(() => {
          return this.sapcrmProvider.updateActivity(newActivity);
        });
    }
  }

  pushDeleteActivity = (newActivity: Activity, isOrder) => {
    console.log(newActivity);
    if (newActivity.HEADER.OBJECT_ID.indexOf("-") != -1) { //Modificación de una pendiente de enviar
      this.deleteAcativityFromQueue(newActivity);
    } else {
      return this.sapcrmProvider.getActivity(newActivity.HEADER.OBJECT_ID)
        .then((originalActivity: Activity) => {
          this.add("SapcrmProvider", "sendActivity", "sendActivitySuccess", "sendActivityFailure", [newActivity, "pushDeleteActivity", isOrder, originalActivity]);
        })
        .then(() => {
          return this.sapcrmProvider.deleteActivity(newActivity);
        });
    }
  }

  sendActivitySuccess(newActivity: Activity, method: string, originalActivity: Activity): Promise<boolean> {
    console.log(newActivity);
    if (newActivity.HEADER.OBJECT_ID.indexOf("-") != -1) { //!originalActivity
      //Is new activity
      return this.sapcrmProvider.deleteActivity(newActivity).then(() => false);
    } else {
      return new Promise<boolean>((resolve) => resolve(false));
    }
  }


  sendPartnerSuccess(newPartner: Partner, originalPartner: Partner): Promise<boolean> {
    if (newPartner.PARTNER.indexOf("-") != -1) { //!originalPartner
      //Is new partner
      return this.sapcrmProvider.deletePartner(newPartner).then(() => false);
    } else {
      return new Promise<boolean>((resolve) => resolve(false));
    }
  }


  sendActivityFailure(error: any, newActivity: Activity, method: string, isOrder: true, originalActivity: Activity): Promise<boolean> {
    if (originalActivity) {
      return this.sapcrmProvider.updateActivity(originalActivity).then(() => false);
    } else {
      return this.sapcrmProvider.deleteActivity(newActivity).then(() => false);
    }
  }

  sendPartnerFailure(error: any, newPartner: Partner, originalPartner: Partner): Promise<boolean> {
    if (originalPartner) {
      return this.sapcrmProvider.updatePartner(originalPartner).then(() => false);
    } else {
      return this.sapcrmProvider.deletePartner(newPartner).then(() => false);
    }
  }

}

interface QueueTask {
  providerName: string,
  sendMethod: string,
  failureMethod: string,
  successMethod: string,
  data: any[],
  hasErrors: boolean
}
