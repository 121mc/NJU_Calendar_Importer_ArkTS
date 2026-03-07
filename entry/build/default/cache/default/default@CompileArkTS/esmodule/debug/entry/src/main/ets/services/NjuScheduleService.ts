import cryptoFramework from "@ohos:security.cryptoFramework";
import util from "@ohos:util";
import { CourseEvent, ScheduleBundle } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import type { SessionInfo } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import { SchoolType } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
import { HttpService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/HttpService";
export class NjuScheduleService {
    static async fetchCurrentSemesterSchedule(session: SessionInfo, includeFinalExams: boolean): Promise<ScheduleBundle> {
        if (session.schoolType === SchoolType.UNDERGRAD) {
            return await NjuScheduleService.fetchUndergrad(session, includeFinalExams);
        }
        return await NjuScheduleService.fetchGraduate(session);
    }
    private static async fetchUndergrad(session: SessionInfo, includeFinalExams: boolean): Promise<ScheduleBundle> {
        let headers = NjuScheduleService.buildEhallAppHeaders(session.ehallAppCookie);
        let currentSemesterRaw = await HttpService.get('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/jshkcb/dqxnxq.do', headers);
        let currentSemesterData = NjuScheduleService.ensureJsonMap(currentSemesterRaw, '本科-当前学期接口');
        let semesterRows = NjuScheduleService.readRows(currentSemesterData, ['datas', 'dqxnxq', 'rows']);
        if (semesterRows.length === 0) {
            throw new Error('本科-当前学期接口未返回 rows。可能是登录态失效，或者接口结构发生变化。');
        }
        let semesterRow = semesterRows[0];
        let semesterId = NjuScheduleService.stringValue(semesterRow, 'DM');
        let semesterName = NjuScheduleService.stringValue(semesterRow, 'MC', semesterId);
        let allSemesterRaw = await HttpService.get('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/jshkcb/cxjcs.do', headers);
        let allSemesterData = NjuScheduleService.ensureJsonMap(allSemesterRaw, '本科-学期列表接口');
        let allSemesterRows = NjuScheduleService.readRows(allSemesterData, ['datas', 'cxjcs', 'rows']);
        let semesterStartText = '';
        for (let i = 0; i < allSemesterRows.length; i++) {
            let row = allSemesterRows[i];
            let current = `${NjuScheduleService.stringValue(row, 'XN')}-${NjuScheduleService.stringValue(row, 'XQ')}`;
            if (current === semesterId) {
                semesterStartText = NjuScheduleService.stringValue(row, 'XQKSRQ');
                break;
            }
        }
        if (semesterStartText.length < 10) {
            throw new Error('未找到当前学期起始日期。');
        }
        let semesterStart = NjuScheduleService.parseDateOnly(semesterStartText.substring(0, 10));
        let courseRaw = await HttpService.postForm('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/xskcb/cxxszhxqkb.do', {
            'XNXQDM': semesterId,
            'pageSize': '9999',
            'pageNumber': '1'
        }, headers);
        let courseData = NjuScheduleService.ensureJsonMap(courseRaw, '本科-课表接口');
        let courseRows = NjuScheduleService.readRows(courseData, ['datas', 'cxxszhxqkb', 'rows']);
        let bundle = new ScheduleBundle();
        bundle.semesterName = semesterName;
        bundle.courseCount = courseRows.length;
        for (let i = 0; i < courseRows.length; i++) {
            let mapped = NjuScheduleService.mapUndergradCourse(courseRows[i], semesterStart);
            for (let j = 0; j < mapped.length; j++) {
                bundle.events.push(mapped[j]);
            }
        }
        if (includeFinalExams) {
            let examRaw = await HttpService.postForm('https://ehallapp.nju.edu.cn/jwapp/sys/studentWdksapApp/WdksapController/cxxsksap.do', {
                'requestParamStr': JSON.stringify({
                    'XNXQDM': semesterId,
                    '*order': '-KSRQ,-KSSJMS'
                })
            }, headers);
            let examData = NjuScheduleService.ensureJsonMap(examRaw, '本科-考试接口');
            let examRows = NjuScheduleService.readRows(examData, ['datas', 'cxxsksap', 'rows']);
            bundle.examCount = examRows.length;
            for (let i = 0; i < examRows.length; i++) {
                let event = NjuScheduleService.mapUndergradExam(examRows[i]);
                if (event !== undefined) {
                    bundle.events.push(event);
                }
            }
        }
        bundle.events.sort((a: CourseEvent, b: CourseEvent) => a.startTime - b.startTime);
        return bundle;
    }
    private static async fetchGraduate(session: SessionInfo): Promise<ScheduleBundle> {
        let headers = NjuScheduleService.buildEhallAppHeaders(session.ehallAppCookie);
        let semesterRaw = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/kfdxnxqcx.do', {}, headers);
        let semesterData = NjuScheduleService.ensureJsonMap(semesterRaw, '研究生-学期接口');
        let semesterRows = NjuScheduleService.readRows(semesterData, ['datas', 'kfdxnxqcx', 'rows']);
        let cutoff = Date.now() + 14 * 24 * 60 * 60 * 1000;
        let eligible: Record<string, Object>[] = [];
        for (let i = 0; i < semesterRows.length; i++) {
            let row = semesterRows[i];
            let start = NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(row, 'KBKFRQ'));
            if (start.getTime() <= cutoff) {
                eligible.push(row);
            }
        }
        if (eligible.length === 0) {
            throw new Error('研究生课表接口没有返回可用学期。');
        }
        eligible.sort((a: Record<string, Object>, b: Record<string, Object>) => {
            return NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(a, 'KBKFRQ')).getTime() -
                NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(b, 'KBKFRQ')).getTime();
        });
        let currentSemester = eligible[eligible.length - 1];
        let semesterId = NjuScheduleService.stringValue(currentSemester, 'XNXQDM');
        let semesterName = NjuScheduleService.stringValue(currentSemester, 'XNXQDM_DISPLAY', semesterId);
        let anchor = NjuScheduleService.normalizeWeekAnchorToMonday(NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(currentSemester, 'KBKFRQ')));
        let courseRaw = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/xspkjgcx.do', {
            'XNXQDM': semesterId,
            'XH': ''
        }, headers);
        let courseData = NjuScheduleService.ensureJsonMap(courseRaw, '研究生-排课结果接口');
        let rawRows = NjuScheduleService.readRows(courseData, ['datas', 'xspkjgcx', 'rows']);
        let mergedRows = NjuScheduleService.mergeGraduateRows(rawRows);
        let taskRaw = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/xsjxrwcx.do?_=1765716674587', {
            'XNXQDM': semesterId,
            'XH': '',
            'pageNumber': '1',
            'pageSize': '100'
        }, headers);
        let taskData = NjuScheduleService.ensureJsonMap(taskRaw, '研究生-教学任务接口');
        let taskRows = NjuScheduleService.readRows(taskData, ['datas', 'xsjxrwcx', 'rows']);
        let courseIdToCampus: Record<string, string> = {};
        for (let i = 0; i < taskRows.length; i++) {
            let row = taskRows[i];
            courseIdToCampus[NjuScheduleService.stringValue(row, 'KCDM')] = NjuScheduleService.stringValue(row, 'XQDM_DISPLAY');
        }
        let bundle = new ScheduleBundle();
        bundle.semesterName = semesterName;
        bundle.courseCount = mergedRows.length;
        bundle.examCount = 0;
        for (let i = 0; i < mergedRows.length; i++) {
            let row = mergedRows[i];
            let campus = courseIdToCampus[NjuScheduleService.stringValue(row, 'KCDM')] ?? '';
            let mapped = NjuScheduleService.mapGraduateCourse(row, anchor, campus);
            for (let j = 0; j < mapped.length; j++) {
                bundle.events.push(mapped[j]);
            }
        }
        bundle.events.sort((a: CourseEvent, b: CourseEvent) => a.startTime - b.startTime);
        return bundle;
    }
    private static buildEhallAppHeaders(cookie: string): Record<string, string> {
        return {
            'Cookie': cookie,
            'Referer': 'https://ehallapp.nju.edu.cn/'
        };
    }
    private static ensureJsonMap(raw: string, apiName: string): Record<string, Object> {
        let text = String(raw ?? '').trim();
        if (text.length === 0) {
            throw new Error(`${apiName} 返回空字符串。`);
        }
        let lower = text.toLowerCase();
        if (lower.startsWith('<!doctype html') || lower.startsWith('<html') || lower.includes('<body') || lower.includes('<head')) {
            let preview = text.replace(/[\r\n]+/g, ' ');
            throw new Error(`${apiName} 返回的是 HTML 页面，不是 JSON。通常表示登录态失效或接口被重定向。前120字符：${preview.substring(0, Math.min(preview.length, 120))}`);
        }
        return JSON.parse(text) as Record<string, Object>;
    }
    private static readRows(data: Record<string, Object>, path: string[]): Record<string, Object>[] {
        let current: Object = data as Object;
        for (let i = 0; i < path.length; i++) {
            let key = path[i];
            let currentMap = current as Record<string, Object>;
            if (currentMap === undefined || currentMap[key] === undefined) {
                return [];
            }
            current = currentMap[key];
        }
        let rows = current as Object[];
        if (rows === undefined || rows.length === undefined) {
            return [];
        }
        let result: Record<string, Object>[] = [];
        for (let i = 0; i < rows.length; i++) {
            result.push(rows[i] as Record<string, Object>);
        }
        return result;
    }
    private static mergeGraduateRows(rows: Record<string, Object>[]): Record<string, Object>[] {
        let grouped: Record<string, Record<string, Object>[]> = {};
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let key = NjuScheduleService.stringValue(row, 'BJMC');
            if (grouped[key] === undefined) {
                grouped[key] = [];
            }
            grouped[key].push(row);
        }
        let result: Record<string, Object>[] = [];
        let groupKeys = Object.keys(grouped);
        for (let i = 0; i < groupKeys.length; i++) {
            let group = grouped[groupKeys[i]];
            group.sort((a: Record<string, Object>, b: Record<string, Object>) => {
                let xqCompare = NjuScheduleService.intValue(a, 'XQ') - NjuScheduleService.intValue(b, 'XQ');
                if (xqCompare !== 0) {
                    return xqCompare;
                }
                return NjuScheduleService.intValue(a, 'KSJCDM') - NjuScheduleService.intValue(b, 'KSJCDM');
            });
            for (let j = 0; j < group.length; j++) {
                let row = group[j];
                if (result.length === 0) {
                    result.push(row);
                    continue;
                }
                let last = result[result.length - 1];
                let canMerge = NjuScheduleService.stringValue(last, 'BJMC') === NjuScheduleService.stringValue(row, 'BJMC') &&
                    NjuScheduleService.intValue(last, 'XQ') === NjuScheduleService.intValue(row, 'XQ') &&
                    NjuScheduleService.stringValue(last, 'ZCBH') === NjuScheduleService.stringValue(row, 'ZCBH') &&
                    NjuScheduleService.stringValue(last, 'JASMC') === NjuScheduleService.stringValue(row, 'JASMC') &&
                    NjuScheduleService.stringValue(last, 'KCDM') === NjuScheduleService.stringValue(row, 'KCDM') &&
                    NjuScheduleService.intValue(last, 'JSJCDM') + 1 === NjuScheduleService.intValue(row, 'KSJCDM');
                if (canMerge) {
                    last['JSJCDM'] = row['JSJCDM'];
                    last['JSSJ'] = row['JSSJ'];
                }
                else {
                    result.push(row);
                }
            }
        }
        return result;
    }
    private static mapUndergradCourse(row: Record<string, Object>, semesterStart: Date): CourseEvent[] {
        let ksjc = NjuScheduleService.intValue(row, 'KSJC');
        let jsjc = NjuScheduleService.intValue(row, 'JSJC');
        if (ksjc <= 0 || jsjc <= 0) {
            return [];
        }
        let startTimes: number[][] = [
            [8, 0], [9, 0], [10, 10], [11, 10], [14, 0], [15, 0], [16, 10], [17, 10], [18, 30], [19, 30], [20, 30], [21, 30], [22, 30]
        ];
        let endTimes: number[][] = [
            [8, 50], [9, 50], [11, 0], [12, 0], [14, 50], [15, 50], [17, 0], [18, 0], [19, 20], [20, 20], [21, 20], [22, 20], [23, 20]
        ];
        if (ksjc > startTimes.length || jsjc > endTimes.length) {
            return [];
        }
        let weekday = NjuScheduleService.intValue(row, 'SKXQ');
        let weekBitmap = NjuScheduleService.stringValue(row, 'SKZC');
        let title = NjuScheduleService.stringValue(row, 'KCM', '未命名课程');
        let location = NjuScheduleService.stringValue(row, 'JASMC');
        let teacher = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(row, 'JSHS') || NjuScheduleService.stringValue(row, 'SKJS'));
        let className = NjuScheduleService.stringValue(row, 'JXBMC');
        let studentClasses = NjuScheduleService.stringValue(row, 'SKBJ');
        let campus = NjuScheduleService.stringValue(row, 'XXXQDM_DISPLAY');
        let result: CourseEvent[] = [];
        for (let i = 0; i < weekBitmap.length; i++) {
            if (weekBitmap.charAt(i) !== '1') {
                continue;
            }
            let date = NjuScheduleService.addDays(semesterStart, i * 7 + weekday - 1);
            let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTimes[ksjc - 1][0], startTimes[ksjc - 1][1], 0, 0);
            let end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTimes[jsjc - 1][0], endTimes[jsjc - 1][1], 0, 0);
            let event = new CourseEvent();
            event.title = title;
            event.startTime = start.getTime();
            event.endTime = end.getTime();
            event.location = location;
            event.importKey = NjuScheduleService.buildImportKey('undergrad', title, event.startTime, event.endTime, location);
            let extras: string[] = [];
            if (studentClasses.length > 0) {
                extras.push(`上课班级：${studentClasses}`);
            }
            event.description = NjuScheduleService.buildDescription(event.importKey, '本科生', teacher, className, campus, extras);
            result.push(event);
        }
        return result;
    }
    private static mapUndergradExam(row: Record<string, Object>): CourseEvent | undefined {
        let dateText = NjuScheduleService.stringValue(row, 'KSRQ');
        let startText = NjuScheduleService.stringValue(row, 'KSKSSJ');
        let endText = NjuScheduleService.stringValue(row, 'KSJSSJ');
        if (dateText.length === 0 || startText.length === 0 || endText.length === 0) {
            return undefined;
        }
        let date = NjuScheduleService.parseDateOnly(dateText.substring(0, 10));
        let startParts = startText.split(':');
        let endParts = endText.split(':');
        if (startParts.length !== 2 || endParts.length !== 2) {
            return undefined;
        }
        let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(startParts[0]), Number(startParts[1]), 0, 0);
        let end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(endParts[0]), Number(endParts[1]), 0, 0);
        let title = `${NjuScheduleService.stringValue(row, 'KCM', '未命名课程')}期末考试`;
        let location = NjuScheduleService.stringValue(row, 'JASMC');
        let teacher = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(row, 'ZJJSXM'));
        let event = new CourseEvent();
        event.title = title;
        event.startTime = start.getTime();
        event.endTime = end.getTime();
        event.location = location;
        event.importKey = NjuScheduleService.buildImportKey('undergrad_exam', title, event.startTime, event.endTime, location);
        event.description = NjuScheduleService.buildDescription(event.importKey, '南京大学本科生', teacher, '', '', ['类型：期末考试']);
        return event;
    }
    private static mapGraduateCourse(row: Record<string, Object>, semesterStart: Date, campus: string): CourseEvent[] {
        let startPair = NjuScheduleService.hhmmToHourMinute(NjuScheduleService.intValue(row, 'KSSJ'));
        let endPair = NjuScheduleService.hhmmToHourMinute(NjuScheduleService.intValue(row, 'JSSJ'));
        let weekBitmap = NjuScheduleService.stringValue(row, 'ZCBH');
        let weekday = NjuScheduleService.intValue(row, 'XQ');
        let courseName = NjuScheduleService.stringValue(row, 'KCMC');
        let title = courseName.length > 0 ? courseName : NjuScheduleService.stringValue(row, 'BJMC', '未命名课程');
        let location = NjuScheduleService.stringValue(row, 'JASMC');
        let teacher = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(row, 'JSXM'));
        let remark = NjuScheduleService.stringValue(row, 'XKBZ');
        let className = NjuScheduleService.stringValue(row, 'BJMC');
        let result: CourseEvent[] = [];
        for (let i = 0; i < weekBitmap.length; i++) {
            if (weekBitmap.charAt(i) !== '1') {
                continue;
            }
            let date = NjuScheduleService.addDays(semesterStart, i * 7 + weekday - 1);
            let start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startPair[0], startPair[1], 0, 0);
            let end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endPair[0], endPair[1], 0, 0);
            let event = new CourseEvent();
            event.title = title;
            event.startTime = start.getTime();
            event.endTime = end.getTime();
            event.location = location;
            event.importKey = NjuScheduleService.buildImportKey('graduate', title, event.startTime, event.endTime, location);
            let extras: string[] = [];
            if (remark.length > 0) {
                extras.push(`选课备注：${remark}`);
            }
            event.description = NjuScheduleService.buildDescription(event.importKey, '南京大学研究生', teacher, className, campus, extras);
            result.push(event);
        }
        return result;
    }
    private static sanitizeTeacherText(text: string): string {
        let value = String(text ?? '');
        value = value.replace(/(^|[^0-9])(1\d{10})(?=[^0-9]|$)/g, '$1');
        value = value
            .replace(/[，,;；|/]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return value;
    }
    // 👇 使用 SHA-1 替换原有的哈希逻辑，与 Flutter 保持完全一致
    private static buildImportKey(prefix: string, title: string, startTime: number, endTime: number, location: string): string {
        let startIso = NjuScheduleService.toDartIso8601String(startTime);
        let endIso = NjuScheduleService.toDartIso8601String(endTime);
        let raw = `${prefix}|${title}|${startIso}|${endIso}|${location}`;
        try {
            let md = cryptoFramework.createMd('SHA1');
            let textEncoder = new util.TextEncoder();
            let dataBlob: cryptoFramework.DataBlob = { data: textEncoder.encode(raw) };
            md.updateSync(dataBlob);
            let digestBlob = md.digestSync();
            let hexString = '';
            for (let i = 0; i < digestBlob.data.length; i++) {
                hexString += digestBlob.data[i].toString(16).padStart(2, '0');
            }
            return hexString;
        }
        catch (e) {
            console.error("SHA-1 计算失败:", e);
            return `${prefix}_fallback_${Date.now()}`;
        }
    }
    // 👇 新增方法：模拟 Dart 的 DateTime.toIso8601String() 格式 (带三位毫秒)
    private static toDartIso8601String(timestamp: number): string {
        let d = new Date(timestamp);
        let YYYY = d.getFullYear().toString().padStart(4, '0');
        let MM = (d.getMonth() + 1).toString().padStart(2, '0');
        let DD = d.getDate().toString().padStart(2, '0');
        let HH = d.getHours().toString().padStart(2, '0');
        let mm = d.getMinutes().toString().padStart(2, '0');
        let ss = d.getSeconds().toString().padStart(2, '0');
        let mmm = d.getMilliseconds().toString().padStart(3, '0');
        return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${mmm}`;
    }
    private static buildDescription(importKey: string, schoolLabel: string, teacher: string, className: string, campus: string, extraLines: string[]): string {
        let lines: string[] = [];
        lines.push('[NJU_SCHEDULE_IMPORT]');
        lines.push(`import_key=${importKey}`);
        if (teacher.length > 0) {
            lines.push(`教师：${teacher}`);
        }
        if (className.length > 0) {
            lines.push(`班级：${className}`);
        }
        if (campus.length > 0) {
            lines.push(`校区：${campus}`);
        }
        for (let i = 0; i < extraLines.length; i++) {
            lines.push(extraLines[i]);
        }
        return lines.join('\n');
    }
    private static stringValue(map: Record<string, Object>, key: string, defaultValue: string = ''): string {
        let value = map[key];
        if (value === undefined || value === null) {
            return defaultValue;
        }
        let text = String(value).trim();
        return text === 'null' ? defaultValue : text;
    }
    private static intValue(map: Record<string, Object>, key: string): number {
        let value = Number(map[key] ?? 0);
        if (isNaN(value)) {
            return 0;
        }
        return Math.trunc(value);
    }
    private static parseDateOnly(text: string): Date {
        let parts = text.split('-');
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0, 0);
    }
    private static parseDateTime(text: string): Date {
        return new Date(text.replace(' ', 'T'));
    }
    private static normalizeWeekAnchorToMonday(anchor: Date): Date {
        let day = anchor.getDay();
        let mondayOffset = day === 0 ? 6 : day - 1;
        return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - mondayOffset, 0, 0, 0, 0);
    }
    private static addDays(date: Date, offset: number): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset, 0, 0, 0, 0);
    }
    private static hhmmToHourMinute(value: number): number[] {
        let hour = Math.floor(value / 100);
        let minute = value % 100;
        return [hour, minute];
    }
}
