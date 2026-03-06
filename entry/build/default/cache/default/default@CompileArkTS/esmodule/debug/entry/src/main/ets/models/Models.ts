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
    static fromJsonString(raw: string): SessionInfo {
        let data = JSON.parse(raw) as Record<string, Object>;
        let session = new SessionInfo();
        session.usernameHint = String(data['usernameHint'] ?? '已登录用户');
        session.schoolType = String(data['schoolType'] ?? SchoolType.UNDERGRAD) === SchoolType.GRADUATE
            ? SchoolType.GRADUATE
            : SchoolType.UNDERGRAD;
        session.authCookie = String(data['authCookie'] ?? '');
        session.ehallCookie = String(data['ehallCookie'] ?? '');
        session.ehallAppCookie = String(data['ehallAppCookie'] ?? '');
        return session;
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
        let min = this.events[0].startTime;
        for (let i = 1; i < this.events.length; i++) {
            if (this.events[i].startTime < min) {
                min = this.events[i].startTime;
            }
        }
        return min;
    }
    latestEnd(): number {
        if (this.events.length === 0) {
            return Date.now();
        }
        let max = this.events[0].endTime;
        for (let i = 1; i < this.events.length; i++) {
            if (this.events[i].endTime > max) {
                max = this.events[i].endTime;
            }
        }
        return max;
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
