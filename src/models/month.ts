import { Week } from './week';
import { ActivityAbstract } from './activityAbstract';

export class Month {

    public Weeks: Array<Week> = [];

    constructor(day: Date){
        this.initializeMonth(day);
    }

    public initializeMonth(day:Date){

        this.Weeks = [];
        let dayCopy = new Date(day);
        let previousWeekofMonth: Week = new Week(dayCopy);

        let i = 0;
        while(  new Date(previousWeekofMonth.Friday.StartingTime).getUTCMonth() >= day.getUTCMonth() &&
                new Date(previousWeekofMonth.Friday.StartingTime).getUTCFullYear() >= day.getUTCFullYear() ||
                (new Date(previousWeekofMonth.Friday.StartingTime).getUTCMonth() == 0 &&
                day.getUTCMonth() == 11)
        ){
            i++;
            previousWeekofMonth = new Week(new Date(previousWeekofMonth.Friday.StartingTime - 604800000));
        }

        let nextWeekofMonth: Week = new Week(new Date(previousWeekofMonth.Monday.StartingTime + 604800000));

        i = 0;
        while(  (new Date(nextWeekofMonth.Monday.StartingTime).getUTCMonth() <= day.getUTCMonth() &&
                new Date(nextWeekofMonth.Monday.StartingTime).getUTCFullYear() <= day.getUTCFullYear()) ||
                (new Date(nextWeekofMonth.Monday.StartingTime).getUTCMonth() == 11 &&
                day.getUTCMonth() == 0)
        ){
            i++;
            this.Weeks.push(nextWeekofMonth);
            nextWeekofMonth = new Week(new Date(nextWeekofMonth.Monday.StartingTime + 604800000));
        }

    }

    public getMonthStartingTime(): number{
        let currentMonth = new Date(this.Weeks[0].Friday.StartingTime).getUTCMonth();
        if(new Date(this.Weeks[0].Monday.StartingTime).getUTCMonth() == currentMonth)
            return this.Weeks[0].Monday.StartingTime;
        if(new Date(this.Weeks[0].Tuesday.StartingTime).getUTCMonth() == currentMonth)
            return this.Weeks[0].Tuesday.StartingTime;
        if(new Date(this.Weeks[0].Wednesday.StartingTime).getUTCMonth() == currentMonth)
            return this.Weeks[0].Wednesday.StartingTime;
        if(new Date(this.Weeks[0].Thursday.StartingTime).getUTCMonth() == currentMonth)
            return this.Weeks[0].Thursday.StartingTime;
        return this.Weeks[0].Friday.StartingTime;
    }

    public getMonthEndingTime(): number{
        let final_index = this.Weeks.length - 1;
        let currentMonth = new Date(this.Weeks[final_index].Monday.EndingTime).getUTCMonth();
        if(new Date(this.Weeks[final_index].Friday.EndingTime).getUTCMonth() == currentMonth)
            return this.Weeks[final_index].Friday.EndingTime;
        if(new Date(this.Weeks[final_index].Thursday.EndingTime).getUTCMonth() == currentMonth)
            return this.Weeks[final_index].Thursday.EndingTime;
        if(new Date(this.Weeks[final_index].Wednesday.EndingTime).getUTCMonth() == currentMonth)
            return this.Weeks[final_index].Wednesday.EndingTime;
        if(new Date(this.Weeks[final_index].Tuesday.EndingTime).getUTCMonth() == currentMonth)
            return this.Weeks[final_index].Tuesday.EndingTime;
        return this.Weeks[final_index].Monday.EndingTime;
    }

    public setMonthActivities(activities: Array<ActivityAbstract>){
        for( let week of this.Weeks ){
            if(week.Monday.StartingTime >= this.getMonthStartingTime() && week.Monday.StartingTime <= this.getMonthEndingTime())
                week.Monday.setDayActivities(activities);
            if(week.Tuesday.StartingTime >= this.getMonthStartingTime() && week.Tuesday.StartingTime <= this.getMonthEndingTime())
                week.Tuesday.setDayActivities(activities);
            if(week.Wednesday.StartingTime >= this.getMonthStartingTime() && week.Wednesday.StartingTime <= this.getMonthEndingTime())
                week.Wednesday.setDayActivities(activities);
            if(week.Thursday.StartingTime >= this.getMonthStartingTime() && week.Thursday.StartingTime <= this.getMonthEndingTime())
                week.Thursday.setDayActivities(activities);
            if(week.Friday.StartingTime >= this.getMonthStartingTime() && week.Friday.StartingTime <= this.getMonthEndingTime())
                week.Friday.setDayActivities(activities);
        }
    }

    public getTotalActivities(): number{
        let count = 0;

        for (let week of this.Weeks){
            if(week.Monday.StartingTime >= this.getMonthStartingTime() && week.Monday.EndingTime <= this.getMonthEndingTime())
                count += week.Monday.getTotalActivities();
            if(week.Tuesday.StartingTime >= this.getMonthStartingTime() && week.Tuesday.EndingTime <= this.getMonthEndingTime())
                count += week.Tuesday.getTotalActivities();
            if(week.Wednesday.StartingTime >= this.getMonthStartingTime() && week.Wednesday.EndingTime <= this.getMonthEndingTime())
                count += week.Wednesday.getTotalActivities();
            if(week.Thursday.StartingTime >= this.getMonthStartingTime() && week.Thursday.EndingTime <= this.getMonthEndingTime())
                count += week.Thursday.getTotalActivities();
            if(week.Friday.StartingTime >= this.getMonthStartingTime() && week.Friday.EndingTime <= this.getMonthEndingTime())
                count += week.Friday.getTotalActivities();
        }

        return count;
    }

    public getMonth(){
        return new Date(this.getMonthStartingTime()).getUTCMonth();
    }

}
