import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { AppSettings } from '../config/app-settings';
import { Month } from '../models/month';
import { Partner } from '../models/partner';
import { Day } from '../models/day';
import { Week } from '../models/week';
import { ActivityAbstractWeb } from '../models/activityAbstractWeb';
import { LoaderProvider } from './loader-provider';
import { LoginProvider } from './login-provider';
import { SapcrmWebProvider } from './sapcrm-web-provider';

@Injectable()
export class CalendarWebProvider {

    private userLogged: Partner;

    private Today: Date;

    public CurrentMonth: Month;
    public CurrentWeek: Week;
    public CurrentDay: Day;

    public weekActivitiesLoaded: boolean = true;
    public monthActivitiesLoaded: boolean = true;
    public dayActivitiesLoaded: boolean = true;

    public totalFilteredActivities: number = 0;

    private searchFilter: string = "";
    private openedFilter: boolean = false;
    private closedFilter: boolean = false;
    private eventsFilter: boolean = false;
    private callFilter: boolean = false;
    private routeFilter: boolean = false;
    private commercialFilter: boolean = false;
    private visitFilter: boolean = false;

    cdRef;

    constructor(
        private platform: Platform,
        private sapcrmWebProvider: SapcrmWebProvider,
        private loaderProvider: LoaderProvider,
        private loginProvider: LoginProvider
    ) {
        this.Today = new Date();
        this.CurrentWeek = new Week(this.Today);
    }

    public moveToCurrentDay() {
        this.CurrentDay = new Day();
        let date = new Date();
        this.CurrentDay.StartingTime = date.getTime() - date.getTime() % 86400000;
        this.CurrentDay.EndingTime = this.CurrentDay.StartingTime + 86400000 - 1;
        this.CurrentWeek = new Week(this.Today);
        this.CurrentMonth = new Month(this.Today);
    }

    public initializeWeekActivities() {
        this.weekActivitiesLoaded = false;
        try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        this.loadWeekActivities();
    }

    public initializeDayActivities() {
        this.dayActivitiesLoaded = false;
        try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        this.loadDayActivities();
    }

    public initializeMonthActivities() {
        this.monthActivitiesLoaded = false;
        try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        this.loadMonthActivities();
    }

    public moveToPreviousDay() {
        if (this.CurrentDay.getWeekDay() == 1) {
            this.CurrentDay.StartingTime = this.CurrentDay.StartingTime - 86400000 * 3;
            this.CurrentDay.EndingTime = this.CurrentDay.EndingTime - 86400000 * 3;
        } else {
            this.CurrentDay.StartingTime = this.CurrentDay.StartingTime - 86400000;
            this.CurrentDay.EndingTime = this.CurrentDay.EndingTime - 86400000;
        }
        this.initializeDayActivities();
    }

    public moveToNextDay() {
        if (this.CurrentDay.getWeekDay() == 5) {
            this.CurrentDay.StartingTime = this.CurrentDay.StartingTime + 86400000 * 3;
            this.CurrentDay.EndingTime = this.CurrentDay.EndingTime + 86400000 * 3;
        } else {
            this.CurrentDay.StartingTime = this.CurrentDay.StartingTime + 86400000;
            this.CurrentDay.EndingTime = this.CurrentDay.EndingTime + 86400000;
        }
        this.initializeDayActivities();
    }

    public moveToPreviousWeek() {
        let previousWeekDay = new Date(this.CurrentWeek.Monday.StartingTime);
        previousWeekDay.setUTCMilliseconds(previousWeekDay.getUTCMilliseconds() - 604800000);
        this.CurrentWeek = new Week(previousWeekDay);
        this.initializeWeekActivities();
    }

    public moveToNextWeek() {
        let nextWeekDay = new Date(this.CurrentWeek.Monday.StartingTime);
        nextWeekDay.setUTCMilliseconds(nextWeekDay.getUTCMilliseconds() + 604800000);
        this.CurrentWeek = new Week(nextWeekDay);
        this.initializeWeekActivities();
    }

    public moveToPreviousMonth() {
        let previousMonthDay = new Date(this.CurrentMonth.getMonthStartingTime());
        previousMonthDay.setUTCMonth((previousMonthDay.getUTCMonth() - 1));
        this.CurrentMonth = new Month(previousMonthDay);
        this.CurrentWeek = new Week(previousMonthDay);
        this.CurrentDay = new Day();
        this.CurrentDay.StartingTime = this.CurrentMonth.getMonthStartingTime();
        this.CurrentDay.EndingTime = this.CurrentMonth.getMonthStartingTime() + 86400000 - 1;
        this.initializeMonthActivities();
    }

    public moveToNextMonth() {
        let nextMonthDay = new Date(this.CurrentMonth.getMonthStartingTime());
        nextMonthDay.setUTCMonth((nextMonthDay.getUTCMonth() + 1));
        this.CurrentMonth = new Month(nextMonthDay);
        this.CurrentWeek = new Week(new Date(this.CurrentMonth.getMonthStartingTime()));
        this.CurrentDay = new Day();
        this.CurrentDay.StartingTime = this.CurrentMonth.getMonthStartingTime();
        this.CurrentDay.EndingTime = this.CurrentMonth.getMonthStartingTime() + 86400000 - 1;
        this.initializeMonthActivities();
    }

    public setUserLogged(user: Partner) {
        this.userLogged = user;
    }

    public getUserLogged(): Partner {
        return this.userLogged;
    }

    public getCurrentWeekStartingDay() {
        return this.CurrentWeek.Monday.getDay();
    }

    public getCurrentWeekEndingDay() {
        return this.CurrentWeek.Sunday.getDay();
    }

    public getCurrentWeekStartingMonthShortString() {
        switch (this.CurrentWeek.Monday.getMonth()) {
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

    public getCurrentWeekEndingMonthShortString() {
        switch (this.CurrentWeek.Sunday.getMonth()) {
            case 0: return "Jan";
            case 1: return "Feb";
            case 2: return "Mar";
            case 3: return "Apr";
            case 4: return "Ma";
            case 5: return "Jun";
            case 6: return "Jul";
            case 7: return "Augt";
            case 8: return "Sep";
            case 9: return "Oct";
            case 10: return "Nov";
            case 11: return "Dec";
        }
    }

    public getCurrentWeekStartingMonthString() {
        if (this.platform.is("iphone"))
            return this.getCurrentWeekStartingMonthShortString();

        switch (this.CurrentWeek.Monday.getMonth()) {
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

    public getCurrentWeekEndingMonthString() {
        if (this.platform.is("iphone"))
            return this.getCurrentWeekEndingMonthShortString();

        switch (this.CurrentWeek.Sunday.getMonth()) {
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


    public setCurrentDay(day: Day) {
        this.CurrentDay = day;
    }

    public setCurrentWeek(day: Day) {
        this.CurrentWeek = new Week(new Date(day.StartingTime));
    }

    public setCurrentMonthFromDay(day: Day) {
        this.CurrentMonth = new Month(new Date(day.StartingTime));
    }

    public setCurrentMonthFromWeek(week: Week) {
        this.CurrentMonth = new Month(new Date(week.getWeekStartingTime()));
        this.CurrentDay = new Day();
        this.CurrentDay.StartingTime = this.CurrentMonth.getMonthStartingTime();
        this.CurrentDay.EndingTime = this.CurrentMonth.getMonthStartingTime() + 86400000 - 1;
    }

    public getCurrentDay() {
        return this.CurrentDay;
    }

    public getCurrentWeek() {
        return this.CurrentWeek;
    }

    public isInMonth(index: number, weekday: number): boolean {
        switch (weekday) {
            case 1: return this.CurrentMonth.getMonth() == this.CurrentMonth.Weeks[index].Monday.getMonth();
            case 2: return this.CurrentMonth.getMonth() == this.CurrentMonth.Weeks[index].Tuesday.getMonth();
            case 3: return this.CurrentMonth.getMonth() == this.CurrentMonth.Weeks[index].Wednesday.getMonth();
            case 4: return this.CurrentMonth.getMonth() == this.CurrentMonth.Weeks[index].Thursday.getMonth();
            case 5: return this.CurrentMonth.getMonth() == this.CurrentMonth.Weeks[index].Friday.getMonth();
        }
    }

    public castMillisecondsToDateSAP(milliseconds: number): number {
        let date = new Date(milliseconds);
        let dateToSAP = ('' + date.getUTCFullYear()) + ('0' + (date.getUTCMonth() + 1)).slice(-2) + ('0' + date.getUTCDate()).slice(-2);

        return Number(dateToSAP);
    }

    loadWeekActivities(): Promise<void> {

        let from = this.castMillisecondsToDateSAP(this.CurrentWeek.getWeekStartingTime());
        let to = this.castMillisecondsToDateSAP(this.CurrentWeek.getWeekEndingTime());

        return this.sapcrmWebProvider.syncPageOptimizedActivitiesList(from, to, this.searchFilter).then((actividades) => {
            actividades.ACTIVITIES = this.applyFilter(actividades.ACTIVITIES);
            actividades.ACTIVITIES = this.sortActivities(actividades.ACTIVITIES);

            this.totalFilteredActivities = Number(actividades.TOTALACTIVITIES);
            this.CurrentWeek.setWeekActivities(actividades.ACTIVITIES);
            this.weekActivitiesLoaded = true;
            try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        });
    }

    loadDayActivities(): Promise<void> {

        let from = this.castMillisecondsToDateSAP(this.CurrentDay.StartingTime);
        let to = this.castMillisecondsToDateSAP(this.CurrentDay.EndingTime + 86400000);

        return this.sapcrmWebProvider.syncPageOptimizedActivitiesList(from, to, this.searchFilter).then((actividades) => {
            actividades.ACTIVITIES = this.applyFilter(actividades.ACTIVITIES);
            actividades.ACTIVITIES = this.sortActivities(actividades.ACTIVITIES);

            this.totalFilteredActivities = Number(actividades.TOTALACTIVITIES);
            this.CurrentDay.setDayActivities(actividades.ACTIVITIES);
            this.dayActivitiesLoaded = true;
            try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        });
    }

    loadMonthActivities(): Promise<void> {

        let from = this.castMillisecondsToDateSAP(this.CurrentMonth.getMonthStartingTime());
        let to = this.castMillisecondsToDateSAP(this.CurrentMonth.getMonthEndingTime() + 86400000);

        return this.sapcrmWebProvider.syncPageOptimizedActivitiesList(from, to, this.searchFilter).then((actividades) => {
            actividades.ACTIVITIES = this.applyFilter(actividades.ACTIVITIES);
            actividades.ACTIVITIES = this.sortActivities(actividades.ACTIVITIES);

            this.totalFilteredActivities = Number(actividades.TOTALACTIVITIES);
            this.CurrentMonth.setMonthActivities(actividades.ACTIVITIES);
            this.monthActivitiesLoaded = true;
            try { this.cdRef.detectChanges(); } catch (err) { console.log("error en el detectChanges"); }
        });
    }

    public isActivityRepeated(activity) {
        if (this.getCurrentDay().StartingTime > activity.DATETIME_FROM)
            return true;
        return false;
    }

    public isActivityRepeatedWeek(activity, dayNumber) {
        let milisecondsStartingTime;
        switch (dayNumber) {
            case 1: milisecondsStartingTime = this.getUTCMillisecondsStartingTime(this.getCurrentWeek().Monday.StartingTime);
                if (milisecondsStartingTime > activity.DATETIME_FROM)
                    return true;
                return false;
            case 2: milisecondsStartingTime = this.getUTCMillisecondsStartingTime(this.getCurrentWeek().Tuesday.StartingTime);
                if (milisecondsStartingTime > activity.DATETIME_FROM)
                    return true;
                return false;
            case 3: milisecondsStartingTime = this.getUTCMillisecondsStartingTime(this.getCurrentWeek().Wednesday.StartingTime);
                if (milisecondsStartingTime > activity.DATETIME_FROM)
                    return true;
                return false;
            case 4: milisecondsStartingTime = this.getUTCMillisecondsStartingTime(this.getCurrentWeek().Thursday.StartingTime);
                if (milisecondsStartingTime > activity.DATETIME_FROM)
                    return true;
                return false;
            case 5: milisecondsStartingTime = this.getUTCMillisecondsStartingTime(this.getCurrentWeek().Friday.StartingTime);
                if (milisecondsStartingTime > activity.DATETIME_FROM)
                    return true;
                return false;
        }
    }

    public getUTCMillisecondsStartingTime(millisecondsStartingTime): number {
        let milliseconds = millisecondsStartingTime;
        let date = new Date(millisecondsStartingTime);

        if (date.toString().split('-')[0] != date.toString()) {
            milliseconds = milliseconds + (Number(date.toString().split('-')[1].split(' ')[0].substring(0, 2).replace("0", "")) * 3600000);
        } else if (date.toString().split('+')[0] != date.toString()) {
            milliseconds = milliseconds - (Number(date.toString().split('+')[1].split(' ')[0].substring(0, 2).replace("0", "")) * 3600000);
        }

        return milliseconds;
    }

    public setFilter(keyword: string, showOpened: boolean, showClosed: boolean, showEvents: boolean, showCall: boolean, showRoute: boolean, showCommercial: boolean, showVisit: boolean) {
        this.searchFilter = keyword;
        this.openedFilter = showOpened;
        this.closedFilter = showClosed;
        this.eventsFilter = showEvents;
        this.callFilter = showCall;
        this.commercialFilter = showCommercial;
        this.visitFilter = showVisit;
        this.routeFilter = showRoute;
    }

    public removeFilter() {
        this.searchFilter = "";
        this.openedFilter = false;
        this.closedFilter = false;
        this.eventsFilter = false;
        this.callFilter = false;
        this.commercialFilter = false;
        this.visitFilter = false;
        this.routeFilter = false;
    }

    public applyFilter(activities: ActivityAbstractWeb[]) {
        let activitiesFilteredStatus: ActivityAbstractWeb[] = [], activitiesFilteredType: ActivityAbstractWeb[] = [];
        let added: boolean;

        //Filtro Estado
        if (this.openedFilter || this.closedFilter) {
            for (let activity of activities) {
                added = false;

                if (!added && this.openedFilter && activity.STATE == 0) { activitiesFilteredStatus.push(activity), added = true }
                if (!added && this.closedFilter && activity.STATE == 1) { activitiesFilteredStatus.push(activity), added = true }
            }
        } else {
            activitiesFilteredStatus = activities;
        }

        //Filtro Tipo
        if (this.eventsFilter || this.callFilter || this.commercialFilter || this.visitFilter || this.routeFilter) {
            for (let activity of activitiesFilteredStatus) {
                added = false;

                if (!added && this.eventsFilter && activity.OPERATION == 'Z002') { activitiesFilteredType.push(activity), added = true }
                if (!added && this.callFilter && activity.OPERATION == 'Z006') { activitiesFilteredType.push(activity), added = true }
                if (!added && this.commercialFilter && activity.OPERATION == 'Z001') { activitiesFilteredType.push(activity), added = true }
                if (!added && this.visitFilter && activity.OPERATION == 'Z011') { activitiesFilteredType.push(activity), added = true }
                if (!added && this.routeFilter && activity.OPERATION == 'Z008') { activitiesFilteredType.push(activity), added = true }
            }
        } else {
            activitiesFilteredType = activitiesFilteredStatus;
        }

        return activitiesFilteredType;
    }

    public sortActivities(activities: ActivityAbstractWeb[]) {
        activities.sort((a, b) => {
            if (a.DATETIME_FROM < b.DATETIME_FROM)
                return -1;
            if (a.DATETIME_FROM > b.DATETIME_FROM)
                return 1;
            return 0;
        });

        return activities;
    }


}
