import { ActivityAbstract } from './activityAbstract';

export class Day {
    
    public StartingTime: number;
    public EndingTime: number;
    public Activities: Array<ActivityAbstract> = [];

    isToday(): boolean{
        let currentDate = new Date().getTime();
        return currentDate >= this.StartingTime && currentDate <= this.EndingTime; 
    }

    getTotalActivities(): number{
        let count = 0;
        
        for(let activity of this.Activities)
            if(activity.STATE == 0 || activity.STATE == 1)
                count ++;

        return count;
    }

    getDay(): number{
        return new Date(this.StartingTime).getUTCDate();
    }

    getMonth(): number{
        return new Date(this.StartingTime).getUTCMonth();
    }

    getYear(): number{
        return new Date(this.StartingTime).getUTCFullYear();
    }

    getWeekDay():number {
        return new Date(this.StartingTime).getUTCDay();
    }

    public setDayActivities(activities: Array<ActivityAbstract>){
        this.Activities = [];
        for(let activity of activities)
            if(activity.DATETIME_TO >= this.getUTCMillisecondsStartingTime(this.StartingTime) && activity.DATETIME_FROM <= this.EndingTime)
                this.Activities.push(activity);
    }

    getOpenedActivities(){
        let count = 0;
        for( let activity of this.Activities )
            if (activity.STATE == 0)
                count++;
        return count;
    }

    getClosedActivities(){
        let count = 0;
        for( let activity of this.Activities )
            if (activity.STATE == 1)
                count++;
        return count;
    }

    public getWeekShortString() {
        switch (this.getWeekDay()) {
            case 0: return "Sun";
            case 1: return "Mon";
            case 2: return "Tue";
            case 3: return "Wed";
            case 4: return "Thu";
            case 5: return "Fri";
            case 6: return "Sat";
        }
    }

    public getWeekString() {
        switch (this.getWeekDay()) {
            case 0: return "Sunday";
            case 1: return "Monday";
            case 2: return "Tuesday";
            case 3: return "Wednesday";
            case 4: return "Thursday";
            case 5: return "Friday";
            case 6: return "Saturday";
        }
    }

    public getMonthShortString() {
        switch (this.getMonth()) {
            case 0: return "Jan";
            case 1: return "Feb";
            case 2: return "Mar";
            case 3: return "Apr";
            case 4: return "Ma";
            case 5: return "Jun";
            case 6: return "Jul";
            case 7: return "Aug";
            case 8: return "Sep";
            case 9: return "Oct";
            case 10: return "Nov";
            case 11: return "Dec";
        }
    }

    public getMonthString() {
        switch (this.getMonth()) {
            case 0: return "January";
            case 1: return "February";
            case 2: return "March";
            case 3: return "April";
            case 4: return "May";
            case 5: return "June";
            case 6: return "July";
            case 7: return "August";
            case 8: return "September";
            case 9: return "October";
            case 10: return "November";
            case 11: return "December";
        }
    }

    private getUTCMillisecondsStartingTime(millisecondsStartingTime): number {
        let milliseconds = millisecondsStartingTime;
        let date = new Date(millisecondsStartingTime);

        if (date.toString().split('-')[0] != date.toString()) {
            milliseconds = milliseconds + (Number(date.toString().split('-')[1].split(' ')[0].substring(0, 2).replace("0", "")) * 3600000);
        } else if (date.toString().split('+')[0] != date.toString()) {
            milliseconds = milliseconds - (Number(date.toString().split('+')[1].split(' ')[0].substring(0, 2).replace("0", "")) * 3600000);
        }

        return milliseconds;
    }

}
