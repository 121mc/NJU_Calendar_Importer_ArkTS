import type common from "@ohos:app.ability.common";
import calendarManager from "@ohos:calendarManager";
import { CalendarOption, SyncResult } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import type { ScheduleBundle } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import { PermissionService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/PermissionService";
export class CalendarSyncService {
    static importMarker: string = '[NJU_SCHEDULE_IMPORT]';
    static appCalendarName: string = 'NJU课表导入';
    static async listWritableCalendars(context: common.UIAbilityContext): Promise<CalendarOption[]> {
        let granted = await PermissionService.requestCalendarPermissions(context);
        if (!granted) {
            throw new Error('未获得日历权限。');
        }
        try {
            let mgr = calendarManager.getCalendarManager(context);
            let calendars = await mgr.getAllCalendars();
            let result: CalendarOption[] = [];
            for (let i = 0; i < calendars.length; i++) {
                let calendar = calendars[i];
                let option = new CalendarOption();
                option.id = String(i);
                try {
                    let account = calendar.getAccount();
                    option.name = String(account.name ?? `系统日历 ${i + 1}`);
                    option.subTitle = String(account.type ?? '');
                }
                catch (error) {
                    option.name = `系统日历 ${i + 1}`;
                    option.subTitle = '';
                }
                option.calendar = calendar;
                result.push(option);
            }
            return result;
        }
        catch (error) {
            throw new Error(`读取系统日历列表失败：${CalendarSyncService.errorToMessage(error)}`);
        }
    }
    static async createOrGetAppCalendar(context: common.UIAbilityContext): Promise<CalendarOption> {
        let granted = await PermissionService.requestCalendarPermissions(context);
        if (!granted) {
            throw new Error('未获得日历权限。');
        }
        try {
            let mgr = calendarManager.getCalendarManager(context);
            let calendars = await mgr.getAllCalendars();
            for (let i = 0; i < calendars.length; i++) {
                let calendar = calendars[i];
                try {
                    let account = calendar.getAccount();
                    if (String(account.name ?? '') === CalendarSyncService.appCalendarName) {
                        let option = new CalendarOption();
                        option.id = `app_${i}`;
                        option.name = String(account.name ?? CalendarSyncService.appCalendarName);
                        option.subTitle = String(account.type ?? 'LOCAL');
                        option.calendar = calendar;
                        return option;
                    }
                }
                catch (error) {
                    console.error(`Read calendar account failed: ${CalendarSyncService.errorToMessage(error)}`);
                }
            }
            let account: calendarManager.CalendarAccount = {
                name: CalendarSyncService.appCalendarName,
                type: calendarManager.CalendarType.LOCAL,
            };
            let created = await mgr.createCalendar(account);
            let option = new CalendarOption();
            option.id = 'app_created';
            option.name = CalendarSyncService.appCalendarName;
            option.subTitle = 'LOCAL';
            option.calendar = created;
            return option;
        }
        catch (error) {
            throw new Error(`创建或获取应用日历失败：${CalendarSyncService.errorToMessage(error)}`);
        }
    }
    static async syncEvents(calendar: calendarManager.Calendar, bundle: ScheduleBundle, overwritePreviousImports: boolean): Promise<SyncResult> {
        let result = new SyncResult();
        let filter = calendarManager.EventFilter.filterByTime(bundle.earliestStart() - 7 * 24 * 60 * 60 * 1000, bundle.latestEnd() + 7 * 24 * 60 * 60 * 1000);
        if (overwritePreviousImports) {
            let oldEvents = await calendar.getEvents(filter);
            for (let i = 0; i < oldEvents.length; i++) {
                let oldEvent = oldEvents[i];
                let description = String(oldEvent.description ?? '');
                if (description.includes(CalendarSyncService.importMarker) && oldEvent.id !== undefined) {
                    await calendar.deleteEvent(oldEvent.id as number);
                    result.deleted += 1;
                }
            }
        }
        for (let i = 0; i < bundle.events.length; i++) {
            let item = bundle.events[i];
            if (item.title.trim().length === 0) {
                result.skipped += 1;
                continue;
            }
            let event: calendarManager.Event = {
                type: calendarManager.EventType.NORMAL,
                title: item.title,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                location: CalendarSyncService.buildEventLocation(item.location),
                identifier: item.importKey,
                reminderTime: [30],
            };
            await calendar.addEvent(event);
            result.created += 1;
        }
        return result;
    }
    static async deleteImportedEvents(calendar: calendarManager.Calendar): Promise<number> {
        let filter = calendarManager.EventFilter.filterByTime(new Date(new Date().getFullYear() - 5, 0, 1).getTime(), new Date(new Date().getFullYear() + 5, 11, 31, 23, 59, 59, 999).getTime());
        let events = await calendar.getEvents(filter);
        let deleted = 0;
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let description = String(event.description ?? '');
            if (description.includes(CalendarSyncService.importMarker) && event.id !== undefined) {
                await calendar.deleteEvent(event.id as number);
                deleted += 1;
            }
        }
        return deleted;
    }
    private static buildEventLocation(text: string): calendarManager.Location {
        let value = String(text ?? '').trim();
        return {
            location: value,
            latitude: 0,
            longitude: 0
        };
    }
    private static errorToMessage(error: Object): string {
        try {
            return JSON.stringify(error);
        }
        catch (e) {
            return String(error);
        }
    }
}
