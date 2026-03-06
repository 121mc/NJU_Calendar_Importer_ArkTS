import { CourseEvent, ScheduleBundle } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import type { SessionInfo } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import { SchoolType } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
import { HttpService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/HttpService";
export class NjuScheduleService {
    static async fetchCurrentSemesterSchedule(k23: SessionInfo, l23: boolean): Promise<ScheduleBundle> {
        if (k23.schoolType === SchoolType.UNDERGRAD) {
            return await NjuScheduleService.fetchUndergrad(k23, l23);
        }
        return await NjuScheduleService.fetchGraduate(k23);
    }
    private static async fetchUndergrad(f22: SessionInfo, g22: boolean): Promise<ScheduleBundle> {
        let h22 = NjuScheduleService.buildEhallAppHeaders(f22.ehallAppCookie);
        let i22 = await HttpService.get('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/jshkcb/dqxnxq.do', h22);
        let j22 = NjuScheduleService.ensureJsonMap(i22, '本科-当前学期接口');
        let k22 = NjuScheduleService.readRows(j22, ['datas', 'dqxnxq', 'rows']);
        if (k22.length === 0) {
            throw new Error('本科-当前学期接口未返回 rows。可能是登录态失效，或者接口结构发生变化。');
        }
        let l22 = k22[0];
        let m22 = NjuScheduleService.stringValue(l22, 'DM');
        let n22 = NjuScheduleService.stringValue(l22, 'MC', m22);
        let o22 = await HttpService.get('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/jshkcb/cxjcs.do', h22);
        let p22 = NjuScheduleService.ensureJsonMap(o22, '本科-学期列表接口');
        let q22 = NjuScheduleService.readRows(p22, ['datas', 'cxjcs', 'rows']);
        let r22 = '';
        for (let h23 = 0; h23 < q22.length; h23++) {
            let i23 = q22[h23];
            let j23 = `${NjuScheduleService.stringValue(i23, 'XN')}-${NjuScheduleService.stringValue(i23, 'XQ')}`;
            if (j23 === m22) {
                r22 = NjuScheduleService.stringValue(i23, 'XQKSRQ');
                break;
            }
        }
        if (r22.length < 10) {
            throw new Error('未找到当前学期起始日期。');
        }
        let s22 = NjuScheduleService.parseDateOnly(r22.substring(0, 10));
        let t22 = await HttpService.postForm('https://ehallapp.nju.edu.cn/jwapp/sys/wdkb/modules/xskcb/cxxszhxqkb.do', {
            'XNXQDM': m22,
            'pageSize': '9999',
            'pageNumber': '1'
        }, h22);
        let u22 = NjuScheduleService.ensureJsonMap(t22, '本科-课表接口');
        let v22 = NjuScheduleService.readRows(u22, ['datas', 'cxxszhxqkb', 'rows']);
        let w22 = new ScheduleBundle();
        w22.semesterName = n22;
        w22.courseCount = v22.length;
        for (let e23 = 0; e23 < v22.length; e23++) {
            let f23 = NjuScheduleService.mapUndergradCourse(v22[e23], s22);
            for (let g23 = 0; g23 < f23.length; g23++) {
                w22.events.push(f23[g23]);
            }
        }
        if (g22) {
            let z22 = await HttpService.postForm('https://ehallapp.nju.edu.cn/jwapp/sys/studentWdksapApp/WdksapController/cxxsksap.do', {
                'requestParamStr': JSON.stringify({
                    'XNXQDM': m22,
                    '*order': '-KSRQ,-KSSJMS'
                })
            }, h22);
            let a23 = NjuScheduleService.ensureJsonMap(z22, '本科-考试接口');
            let b23 = NjuScheduleService.readRows(a23, ['datas', 'cxxsksap', 'rows']);
            w22.examCount = b23.length;
            for (let c23 = 0; c23 < b23.length; c23++) {
                let d23 = NjuScheduleService.mapUndergradExam(b23[c23]);
                if (d23 !== undefined) {
                    w22.events.push(d23);
                }
            }
        }
        w22.events.sort((x22: CourseEvent, y22: CourseEvent) => x22.startTime - y22.startTime);
        return w22;
    }
    private static async fetchGraduate(x20: SessionInfo): Promise<ScheduleBundle> {
        let y20 = NjuScheduleService.buildEhallAppHeaders(x20.ehallAppCookie);
        let z20 = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/kfdxnxqcx.do', {}, y20);
        let a21 = NjuScheduleService.ensureJsonMap(z20, '研究生-学期接口');
        let b21 = NjuScheduleService.readRows(a21, ['datas', 'kfdxnxqcx', 'rows']);
        let c21 = Date.now() + 14 * 24 * 60 * 60 * 1000;
        let d21: Record<string, Object>[] = [];
        for (let c22 = 0; c22 < b21.length; c22++) {
            let d22 = b21[c22];
            let e22 = NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(d22, 'KBKFRQ'));
            if (e22.getTime() <= c21) {
                d21.push(d22);
            }
        }
        if (d21.length === 0) {
            throw new Error('研究生课表接口没有返回可用学期。');
        }
        d21.sort((a22: Record<string, Object>, b22: Record<string, Object>) => {
            return NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(a22, 'KBKFRQ')).getTime() -
                NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(b22, 'KBKFRQ')).getTime();
        });
        let e21 = d21[d21.length - 1];
        let f21 = NjuScheduleService.stringValue(e21, 'XNXQDM');
        let g21 = NjuScheduleService.stringValue(e21, 'XNXQDM_DISPLAY', f21);
        let h21 = NjuScheduleService.normalizeWeekAnchorToMonday(NjuScheduleService.parseDateTime(NjuScheduleService.stringValue(e21, 'KBKFRQ')));
        let i21 = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/xspkjgcx.do', {
            'XNXQDM': f21,
            'XH': ''
        }, y20);
        let j21 = NjuScheduleService.ensureJsonMap(i21, '研究生-排课结果接口');
        let k21 = NjuScheduleService.readRows(j21, ['datas', 'xspkjgcx', 'rows']);
        let l21 = NjuScheduleService.mergeGraduateRows(k21);
        let m21 = await HttpService.postForm('https://ehallapp.nju.edu.cn/gsapp/sys/wdkbapp/modules/xskcb/xsjxrwcx.do?_=1765716674587', {
            'XNXQDM': f21,
            'XH': '',
            'pageNumber': '1',
            'pageSize': '100'
        }, y20);
        let n21 = NjuScheduleService.ensureJsonMap(m21, '研究生-教学任务接口');
        let o21 = NjuScheduleService.readRows(n21, ['datas', 'xsjxrwcx', 'rows']);
        let p21: Record<string, string> = {};
        for (let y21 = 0; y21 < o21.length; y21++) {
            let z21 = o21[y21];
            p21[NjuScheduleService.stringValue(z21, 'KCDM')] = NjuScheduleService.stringValue(z21, 'XQDM_DISPLAY');
        }
        let q21 = new ScheduleBundle();
        q21.semesterName = g21;
        q21.courseCount = l21.length;
        q21.examCount = 0;
        for (let t21 = 0; t21 < l21.length; t21++) {
            let u21 = l21[t21];
            let v21 = p21[NjuScheduleService.stringValue(u21, 'KCDM')] ?? '';
            let w21 = NjuScheduleService.mapGraduateCourse(u21, h21, v21);
            for (let x21 = 0; x21 < w21.length; x21++) {
                q21.events.push(w21[x21]);
            }
        }
        q21.events.sort((r21: CourseEvent, s21: CourseEvent) => r21.startTime - s21.startTime);
        return q21;
    }
    private static buildEhallAppHeaders(w20: string): Record<string, string> {
        return {
            'Cookie': w20,
            'Referer': 'https://ehallapp.nju.edu.cn/'
        };
    }
    private static ensureJsonMap(r20: string, s20: string): Record<string, Object> {
        let t20 = String(r20 ?? '').trim();
        if (t20.length === 0) {
            throw new Error(`${s20} 返回空字符串。`);
        }
        let u20 = t20.toLowerCase();
        if (u20.startsWith('<!doctype html') || u20.startsWith('<html') || u20.includes('<body') || u20.includes('<head')) {
            let v20 = t20.replace(/[\r\n]+/g, ' ');
            throw new Error(`${s20} 返回的是 HTML 页面，不是 JSON。通常表示登录态失效或接口被重定向。前120字符：${v20.substring(0, Math.min(v20.length, 120))}`);
        }
        return JSON.parse(t20) as Record<string, Object>;
    }
    private static readRows(i20: Record<string, Object>, j20: string[]): Record<string, Object>[] {
        let k20: Object = i20 as Object;
        for (let o20 = 0; o20 < j20.length; o20++) {
            let p20 = j20[o20];
            let q20 = k20 as Record<string, Object>;
            if (q20 === undefined || q20[p20] === undefined) {
                return [];
            }
            k20 = q20[p20];
        }
        let l20 = k20 as Object[];
        if (l20 === undefined || l20.length === undefined) {
            return [];
        }
        let m20: Record<string, Object>[] = [];
        for (let n20 = 0; n20 < l20.length; n20++) {
            m20.push(l20[n20] as Record<string, Object>);
        }
        return m20;
    }
    private static mergeGraduateRows(s19: Record<string, Object>[]): Record<string, Object>[] {
        let t19: Record<string, Record<string, Object>[]> = {};
        for (let f20 = 0; f20 < s19.length; f20++) {
            let g20 = s19[f20];
            let h20 = NjuScheduleService.stringValue(g20, 'BJMC');
            if (t19[h20] === undefined) {
                t19[h20] = [];
            }
            t19[h20].push(g20);
        }
        let u19: Record<string, Object>[] = [];
        let v19 = Object.keys(t19);
        for (let w19 = 0; w19 < v19.length; w19++) {
            let x19 = t19[v19[w19]];
            x19.sort((c20: Record<string, Object>, d20: Record<string, Object>) => {
                let e20 = NjuScheduleService.intValue(c20, 'XQ') - NjuScheduleService.intValue(d20, 'XQ');
                if (e20 !== 0) {
                    return e20;
                }
                return NjuScheduleService.intValue(c20, 'KSJCDM') - NjuScheduleService.intValue(d20, 'KSJCDM');
            });
            for (let y19 = 0; y19 < x19.length; y19++) {
                let z19 = x19[y19];
                if (u19.length === 0) {
                    u19.push(z19);
                    continue;
                }
                let a20 = u19[u19.length - 1];
                let b20 = NjuScheduleService.stringValue(a20, 'BJMC') === NjuScheduleService.stringValue(z19, 'BJMC') &&
                    NjuScheduleService.intValue(a20, 'XQ') === NjuScheduleService.intValue(z19, 'XQ') &&
                    NjuScheduleService.stringValue(a20, 'ZCBH') === NjuScheduleService.stringValue(z19, 'ZCBH') &&
                    NjuScheduleService.stringValue(a20, 'JASMC') === NjuScheduleService.stringValue(z19, 'JASMC') &&
                    NjuScheduleService.stringValue(a20, 'KCDM') === NjuScheduleService.stringValue(z19, 'KCDM') &&
                    NjuScheduleService.intValue(a20, 'JSJCDM') + 1 === NjuScheduleService.intValue(z19, 'KSJCDM');
                if (b20) {
                    a20['JSJCDM'] = z19['JSJCDM'];
                    a20['JSSJ'] = z19['JSSJ'];
                }
                else {
                    u19.push(z19);
                }
            }
        }
        return u19;
    }
    private static mapUndergradCourse(x18: Record<string, Object>, y18: Date): CourseEvent[] {
        let z18 = NjuScheduleService.intValue(x18, 'KSJC');
        let a19 = NjuScheduleService.intValue(x18, 'JSJC');
        if (z18 <= 0 || a19 <= 0) {
            return [];
        }
        let b19: number[][] = [
            [8, 0], [9, 0], [10, 10], [11, 10], [14, 0], [15, 0], [16, 10], [17, 10], [18, 30], [19, 30], [20, 30], [21, 30], [22, 30]
        ];
        let c19: number[][] = [
            [8, 50], [9, 50], [11, 0], [12, 0], [14, 50], [15, 50], [17, 0], [18, 0], [19, 20], [20, 20], [21, 20], [22, 20], [23, 20]
        ];
        if (z18 > b19.length || a19 > c19.length) {
            return [];
        }
        let d19 = NjuScheduleService.intValue(x18, 'SKXQ');
        let e19 = NjuScheduleService.stringValue(x18, 'SKZC');
        let f19 = NjuScheduleService.stringValue(x18, 'KCM', '未命名课程');
        let g19 = NjuScheduleService.stringValue(x18, 'JASMC');
        let h19 = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(x18, 'JSHS') || NjuScheduleService.stringValue(x18, 'SKJS'));
        let i19 = NjuScheduleService.stringValue(x18, 'JXBMC');
        let j19 = NjuScheduleService.stringValue(x18, 'SKBJ');
        let k19 = NjuScheduleService.stringValue(x18, 'XXXQDM_DISPLAY');
        let l19: CourseEvent[] = [];
        for (let m19 = 0; m19 < e19.length; m19++) {
            if (e19.charAt(m19) !== '1') {
                continue;
            }
            let n19 = NjuScheduleService.addDays(y18, m19 * 7 + d19 - 1);
            let o19 = new Date(n19.getFullYear(), n19.getMonth(), n19.getDate(), b19[z18 - 1][0], b19[z18 - 1][1], 0, 0);
            let p19 = new Date(n19.getFullYear(), n19.getMonth(), n19.getDate(), c19[a19 - 1][0], c19[a19 - 1][1], 0, 0);
            let q19 = new CourseEvent();
            q19.title = f19;
            q19.startTime = o19.getTime();
            q19.endTime = p19.getTime();
            q19.location = g19;
            q19.importKey = NjuScheduleService.buildImportKey('undergrad', f19, q19.startTime, q19.endTime, g19);
            let r19: string[] = [];
            if (j19.length > 0) {
                r19.push(`上课班级：${j19}`);
            }
            q19.description = NjuScheduleService.buildDescription(q19.importKey, '南京大学本科生', h19, i19, k19, r19);
            l19.push(q19);
        }
        return l19;
    }
    private static mapUndergradExam(k18: Record<string, Object>): CourseEvent | undefined {
        let l18 = NjuScheduleService.stringValue(k18, 'KSRQ');
        let m18 = NjuScheduleService.stringValue(k18, 'KSKSSJ');
        let n18 = NjuScheduleService.stringValue(k18, 'KSJSSJ');
        if (l18.length === 0 || m18.length === 0 || n18.length === 0) {
            return undefined;
        }
        let o18 = NjuScheduleService.parseDateOnly(l18.substring(0, 10));
        let p18 = m18.split(':');
        let q18 = n18.split(':');
        if (p18.length !== 2 || q18.length !== 2) {
            return undefined;
        }
        let r18 = new Date(o18.getFullYear(), o18.getMonth(), o18.getDate(), Number(p18[0]), Number(p18[1]), 0, 0);
        let s18 = new Date(o18.getFullYear(), o18.getMonth(), o18.getDate(), Number(q18[0]), Number(q18[1]), 0, 0);
        let t18 = `${NjuScheduleService.stringValue(k18, 'KCM', '未命名课程')}期末考试`;
        let u18 = NjuScheduleService.stringValue(k18, 'JASMC');
        let v18 = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(k18, 'ZJJSXM'));
        let w18 = new CourseEvent();
        w18.title = t18;
        w18.startTime = r18.getTime();
        w18.endTime = s18.getTime();
        w18.location = u18;
        w18.importKey = NjuScheduleService.buildImportKey('undergrad_exam', t18, w18.startTime, w18.endTime, u18);
        w18.description = NjuScheduleService.buildDescription(w18.importKey, '南京大学本科生', v18, '', '', ['类型：期末考试']);
        return w18;
    }
    private static mapGraduateCourse(q17: Record<string, Object>, r17: Date, s17: string): CourseEvent[] {
        let t17 = NjuScheduleService.hhmmToHourMinute(NjuScheduleService.intValue(q17, 'KSSJ'));
        let u17 = NjuScheduleService.hhmmToHourMinute(NjuScheduleService.intValue(q17, 'JSSJ'));
        let v17 = NjuScheduleService.stringValue(q17, 'ZCBH');
        let w17 = NjuScheduleService.intValue(q17, 'XQ');
        let x17 = NjuScheduleService.stringValue(q17, 'KCMC');
        let y17 = x17.length > 0 ? x17 : NjuScheduleService.stringValue(q17, 'BJMC', '未命名课程');
        let z17 = NjuScheduleService.stringValue(q17, 'JASMC');
        let a18 = NjuScheduleService.sanitizeTeacherText(NjuScheduleService.stringValue(q17, 'JSXM'));
        let b18 = NjuScheduleService.stringValue(q17, 'XKBZ');
        let c18 = NjuScheduleService.stringValue(q17, 'BJMC');
        let d18: CourseEvent[] = [];
        for (let e18 = 0; e18 < v17.length; e18++) {
            if (v17.charAt(e18) !== '1') {
                continue;
            }
            let f18 = NjuScheduleService.addDays(r17, e18 * 7 + w17 - 1);
            let g18 = new Date(f18.getFullYear(), f18.getMonth(), f18.getDate(), t17[0], t17[1], 0, 0);
            let h18 = new Date(f18.getFullYear(), f18.getMonth(), f18.getDate(), u17[0], u17[1], 0, 0);
            let i18 = new CourseEvent();
            i18.title = y17;
            i18.startTime = g18.getTime();
            i18.endTime = h18.getTime();
            i18.location = z17;
            i18.importKey = NjuScheduleService.buildImportKey('graduate', y17, i18.startTime, i18.endTime, z17);
            let j18: string[] = [];
            if (b18.length > 0) {
                j18.push(`选课备注：${b18}`);
            }
            i18.description = NjuScheduleService.buildDescription(i18.importKey, '南京大学研究生', a18, c18, s17, j18);
            d18.push(i18);
        }
        return d18;
    }
    private static sanitizeTeacherText(o17: string): string {
        let p17 = String(o17 ?? '');
        p17 = p17.replace(/(^|[^0-9])(1\d{10})(?=[^0-9]|$)/g, '$1');
        p17 = p17.replace(/[，,;；|/]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return p17;
    }
    private static buildImportKey(g17: string, h17: string, i17: number, j17: number, k17: string): string {
        let l17 = `${g17}|${h17}|${i17}|${j17}|${k17}`;
        let m17 = 5381;
        for (let n17 = 0; n17 < l17.length; n17++) {
            m17 = ((m17 << 5) + m17) + l17.charCodeAt(n17);
            m17 = m17 & 0x7fffffff;
        }
        return `${g17}_${m17.toString(16)}`;
    }
    private static buildDescription(y16: string, z16: string, a17: string, b17: string, c17: string, d17: string[]): string {
        let e17: string[] = [];
        e17.push('[NJU_SCHEDULE_IMPORT]');
        e17.push(`import_key=${y16}`);
        e17.push(`学校：${z16}`);
        if (a17.length > 0) {
            e17.push(`教师：${a17}`);
        }
        if (b17.length > 0) {
            e17.push(`班级：${b17}`);
        }
        if (c17.length > 0) {
            e17.push(`校区：${c17}`);
        }
        for (let f17 = 0; f17 < d17.length; f17++) {
            e17.push(d17[f17]);
        }
        return e17.join('\n');
    }
    private static stringValue(t16: Record<string, Object>, u16: string, v16: string = ''): string {
        let w16 = t16[u16];
        if (w16 === undefined || w16 === null) {
            return v16;
        }
        let x16 = String(w16).trim();
        return x16 === 'null' ? v16 : x16;
    }
    private static intValue(q16: Record<string, Object>, r16: string): number {
        let s16 = Number(q16[r16] ?? 0);
        if (isNaN(s16)) {
            return 0;
        }
        return Math.trunc(s16);
    }
    private static parseDateOnly(o16: string): Date {
        let p16 = o16.split('-');
        return new Date(Number(p16[0]), Number(p16[1]) - 1, Number(p16[2]), 0, 0, 0, 0);
    }
    private static parseDateTime(n16: string): Date {
        return new Date(n16.replace(' ', 'T'));
    }
    private static normalizeWeekAnchorToMonday(k16: Date): Date {
        let l16 = k16.getDay();
        let m16 = l16 === 0 ? 6 : l16 - 1;
        return new Date(k16.getFullYear(), k16.getMonth(), k16.getDate() - m16, 0, 0, 0, 0);
    }
    private static addDays(i16: Date, j16: number): Date {
        return new Date(i16.getFullYear(), i16.getMonth(), i16.getDate() + j16, 0, 0, 0, 0);
    }
    private static hhmmToHourMinute(f16: number): number[] {
        let g16 = Math.floor(f16 / 100);
        let h16 = f16 % 100;
        return [g16, h16];
    }
}
