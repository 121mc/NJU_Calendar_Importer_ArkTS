import { SchoolType } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
import type calendarManager from "@ohos:calendarManager";
export class SessionInfo {
    usernameHint: string = '';
    schoolType: SchoolType = SchoolType.UNDERGRAD;
    authCookie: string = '';
    ehallCookie: string = '';
    ehallAppCookie: string = '';
    toJsonString(): string {
        return JSON.stringify({
            usernameHint: this.usernameHint,
            schoolType: this.schoolType,
            authCookie: this.authCookie,
            ehallCookie: this.ehallCookie,
            ehallAppCookie: this.ehallAppCookie,
        });
    }
    static fromJsonString(h: string): SessionInfo {
        let i = JSON.parse(h) as Record<string, Object>;
        let j = new SessionInfo();
        j.usernameHint = String(i['usernameHint'] ?? '已登录用户');
        j.schoolType = String(i['schoolType'] ?? SchoolType.UNDERGRAD) === SchoolType.GRADUATE
            ? SchoolType.GRADUATE
            : SchoolType.UNDERGRAD;
        j.authCookie = String(i['authCookie'] ?? '');
        j.ehallCookie = String(i['ehallCookie'] ?? '');
        j.ehallAppCookie = String(i['ehallAppCookie'] ?? '');
        return j;
    }
}
export class CourseEvent {
    title: string = '';
    startTime: number = 0;
    endTime: number = 0;
    location: string = '';
    description: string = '';
    importKey: string = '';
}
export class ScheduleBundle {
    semesterName: string = '';
    events: CourseEvent[] = [];
    courseCount: number = 0;
    examCount: number = 0;
    earliestStart(): number {
        if (this.events.length === 0) {
            return Date.now();
        }
        let f = this.events[0].startTime;
        for (let g = 1; g < this.events.length; g++) {
            if (this.events[g].startTime < f) {
                f = this.events[g].startTime;
            }
        }
        return f;
    }
    latestEnd(): number {
        if (this.events.length === 0) {
            return Date.now();
        }
        let d = this.events[0].endTime;
        for (let e = 1; e < this.events.length; e++) {
            if (this.events[e].endTime > d) {
                d = this.events[e].endTime;
            }
        }
        return d;
    }
}
export class SyncResult {
    created: number = 0;
    deleted: number = 0;
    skipped: number = 0;
    warning: string = '';
}
export class CalendarOption {
    id: string = '';
    name: string = '';
    subTitle: string = '';
    calendar: calendarManager.Calendar | undefined = undefined;
}
