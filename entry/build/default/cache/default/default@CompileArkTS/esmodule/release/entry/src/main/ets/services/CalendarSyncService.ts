import type common from "@ohos:app.ability.common";
import calendarManager from "@ohos:calendarManager";
import { CalendarOption, SyncResult } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import type { ScheduleBundle } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import { PermissionService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/PermissionService";
export class CalendarSyncService {
    static importMarker: string = '[NJU_SCHEDULE_IMPORT]';
    static appCalendarName: string = 'NJU课表导入';
    static async listWritableCalendars(q14: common.UIAbilityContext): Promise<CalendarOption[]> {
        let r14 = await PermissionService.requestCalendarPermissions(q14);
        if (!r14) {
            throw new Error('未获得日历权限。');
        }
        try {
            let t14 = calendarManager.getCalendarManager(q14);
            let u14 = await t14.getAllCalendars();
            let v14: CalendarOption[] = [];
            for (let w14 = 0; w14 < u14.length; w14++) {
                let x14 = u14[w14];
                let y14 = new CalendarOption();
                y14.id = String(w14);
                try {
                    let a15 = x14.getAccount();
                    y14.name = String(a15.name ?? `系统日历 ${w14 + 1}`);
                    y14.subTitle = String(a15.type ?? '');
                }
                catch (z14) {
                    y14.name = `系统日历 ${w14 + 1}`;
                    y14.subTitle = '';
                }
                y14.calendar = x14;
                v14.push(y14);
            }
            return v14;
        }
        catch (s14) {
            throw new Error(`读取系统日历列表失败：${CalendarSyncService.errorToMessage(s14)}`);
        }
    }
    static async createOrGetAppCalendar(d14: common.UIAbilityContext): Promise<CalendarOption> {
        let e14 = await PermissionService.requestCalendarPermissions(d14);
        if (!e14) {
            throw new Error('未获得日历权限。');
        }
        try {
            let g14 = calendarManager.getCalendarManager(d14);
            let h14 = await g14.getAllCalendars();
            for (let l14 = 0; l14 < h14.length; l14++) {
                let m14 = h14[l14];
                try {
                    let o14 = m14.getAccount();
                    if (String(o14.name ?? '') === CalendarSyncService.appCalendarName) {
                        let p14 = new CalendarOption();
                        p14.id = `app_${l14}`;
                        p14.name = String(o14.name ?? CalendarSyncService.appCalendarName);
                        p14.subTitle = String(o14.type ?? 'LOCAL');
                        p14.calendar = m14;
                        return p14;
                    }
                }
                catch (n14) {
                    console.error(`Read calendar account failed: ${CalendarSyncService.errorToMessage(n14)}`);
                }
            }
            let i14: calendarManager.CalendarAccount = {
                name: CalendarSyncService.appCalendarName,
                type: calendarManager.CalendarType.LOCAL,
            };
            let j14 = await g14.createCalendar(i14);
            let k14 = new CalendarOption();
            k14.id = 'app_created';
            k14.name = CalendarSyncService.appCalendarName;
            k14.subTitle = 'LOCAL';
            k14.calendar = j14;
            return k14;
        }
        catch (f14) {
            throw new Error(`创建或获取应用日历失败：${CalendarSyncService.errorToMessage(f14)}`);
        }
    }
    static async syncEvents(r13: calendarManager.Calendar, s13: ScheduleBundle, t13: boolean): Promise<SyncResult> {
        let u13 = new SyncResult();
        let v13 = calendarManager.EventFilter.filterByTime(s13.earliestStart() - 7 * 24 * 60 * 60 * 1000, s13.latestEnd() + 7 * 24 * 60 * 60 * 1000);
        if (t13) {
            let z13 = await r13.getEvents(v13);
            for (let a14 = 0; a14 < z13.length; a14++) {
                let b14 = z13[a14];
                let c14 = String(b14.description ?? '');
                if (c14.includes(CalendarSyncService.importMarker) && b14.id !== undefined) {
                    await r13.deleteEvent(b14.id as number);
                    u13.deleted += 1;
                }
            }
        }
        for (let w13 = 0; w13 < s13.events.length; w13++) {
            let x13 = s13.events[w13];
            if (x13.title.trim().length === 0) {
                u13.skipped += 1;
                continue;
            }
            let y13: calendarManager.Event = {
                type: calendarManager.EventType.NORMAL,
                title: x13.title,
                description: x13.description,
                startTime: x13.startTime,
                endTime: x13.endTime,
                location: CalendarSyncService.buildEventLocation(x13.location),
                identifier: x13.importKey,
                reminderTime: [30],
            };
            await r13.addEvent(y13);
            u13.created += 1;
        }
        return u13;
    }
    static async deleteImportedEvents(k13: calendarManager.Calendar): Promise<number> {
        let l13 = calendarManager.EventFilter.filterByTime(new Date(new Date().getFullYear() - 5, 0, 1).getTime(), new Date(new Date().getFullYear() + 5, 11, 31, 23, 59, 59, 999).getTime());
        let m13 = await k13.getEvents(l13);
        let n13 = 0;
        for (let o13 = 0; o13 < m13.length; o13++) {
            let p13 = m13[o13];
            let q13 = String(p13.description ?? '');
            if (q13.includes(CalendarSyncService.importMarker) && p13.id !== undefined) {
                await k13.deleteEvent(p13.id as number);
                n13 += 1;
            }
        }
        return n13;
    }
    private static buildEventLocation(i13: string): calendarManager.Location {
        let j13 = String(i13 ?? '').trim();
        return {
            location: j13,
            latitude: 0,
            longitude: 0
        };
    }
    private static errorToMessage(g13: Object): string {
        try {
            return JSON.stringify(g13);
        }
        catch (h13) {
            return String(g13);
        }
    }
}
