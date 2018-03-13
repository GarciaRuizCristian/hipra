import { ActivityAbstract } from './activityAbstract';
import { Day } from "./day";

export class Week {

    public Monday: Day;
    public Tuesday: Day;
    public Wednesday: Day;
    public Thursday: Day;
    public Friday: Day;
    public Saturday: Day;
    public Sunday: Day;

    constructor(day: Date){
        this.initializeWeek(day);
    }

    public initializeWeek(day:Date){

        let weekStartingTime;
        let copyDay = new Date(day);
        if(day.getUTCDay() == 0){
            weekStartingTime= copyDay.setUTCDate(day.getUTCDate() + 1);
        }else
            weekStartingTime= copyDay.setUTCDate(day.getUTCDate() - day.getUTCDay() + 1);
        weekStartingTime = copyDay.getTime() - (copyDay.getTime() % 86400000);

        this.Monday = new Day();
        this.Monday.StartingTime = weekStartingTime;
        this.Monday.EndingTime = weekStartingTime + 86400000 - 1;

        this.Tuesday = new Day();
        this.Tuesday.StartingTime = weekStartingTime + 86400000;
        this.Tuesday.EndingTime = weekStartingTime + 86400000 * 2 - 1;

        this.Wednesday = new Day();
        this.Wednesday.StartingTime = weekStartingTime + 86400000 * 2;
        this.Wednesday.EndingTime = weekStartingTime + 86400000 * 3 - 1;

        this.Thursday = new Day();
        this.Thursday.StartingTime = weekStartingTime + 86400000 * 3;
        this.Thursday.EndingTime = weekStartingTime + 86400000 * 4 - 1;

        this.Friday = new Day();
        this.Friday.StartingTime = weekStartingTime  + 86400000 * 4;
        this.Friday.EndingTime = weekStartingTime + 86400000 * 5 - 1;

        this.Saturday = new Day();
        this.Saturday.StartingTime = weekStartingTime  + 86400000 * 5;
        this.Saturday.EndingTime = weekStartingTime + 86400000 * 6 - 1;

        this.Sunday = new Day();
        this.Sunday.StartingTime = weekStartingTime  + 86400000 * 6;
        this.Sunday.EndingTime = weekStartingTime + 86400000 * 7 - 1;
        
    }

    public getWeekStartingTime(){
        return this.Monday.StartingTime;
    }

    public getWeekEndingTime(){
        return this.Sunday.EndingTime;
    }

    public setWeekActivities(activities: Array<ActivityAbstract>){
        this.Monday.setDayActivities(activities);
        this.Tuesday.setDayActivities(activities);
        this.Wednesday.setDayActivities(activities);
        this.Thursday.setDayActivities(activities);
        this.Friday.setDayActivities(activities);
    }

    public getTotalWeekActivities(): number{
        return  this.Monday.getTotalActivities() + 
                this.Tuesday.getTotalActivities() +
                this.Wednesday.getTotalActivities() +
                this.Thursday.getTotalActivities() +
                this.Friday.getTotalActivities();
    }

}
