if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    context?: common.UIAbilityContext | undefined;
    loginWebController?: webview.WebviewController;
    privacyAccepted?: boolean;
    isReady?: boolean;
    schoolType?: SchoolType;
    usernameHint?: string;
    session?: SessionInfo | undefined;
    bundle?: ScheduleBundle | undefined;
    calendars?: CalendarOption[];
    selectedCalendarIndex?: number;
    includeFinalExams?: boolean;
    overwritePreviousImports?: boolean;
    loadingSchedule?: boolean;
    loadingCalendars?: boolean;
    syncingCalendar?: boolean;
    deletingImported?: boolean;
    showLoginPanel?: boolean;
    savingLoginState?: boolean;
    webCurrentUrl?: string;
    loginHintText?: string;
    dialogController?: CustomDialogController;
}
interface PrivacyDialog_Params {
    controller?: CustomDialogController;
    cancel?: () => void;
    confirm?: () => void;
    openPrivacyPage?: () => void;
}
import promptAction from "@ohos:promptAction";
import webview from "@ohos:web.webview";
import type common from "@ohos:app.ability.common";
import router from "@ohos:router";
import dataPreferences from "@ohos:data.preferences";
import type { CourseEvent, ScheduleBundle, SessionInfo, CalendarOption } from '../models/Models';
import { SchoolType, SchoolTypeHelper } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
import { AuthService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/AuthService";
import { HttpService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/HttpService";
import { NjuScheduleService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/NjuScheduleService";
import { CalendarSyncService } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/CalendarSyncService";
class PrivacyDialog extends ViewPU {
    constructor(r10, s10, t10, u10 = -1, v10 = undefined, w10) {
        super(r10, t10, u10, w10);
        if (typeof v10 === "function") {
            this.paramsGenerator_ = v10;
        }
        this.controller = undefined;
        this.cancel = () => { };
        this.confirm = () => { };
        this.openPrivacyPage = () => { };
        this.setInitiallyProvidedValue(s10);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(q10: PrivacyDialog_Params) {
        if (q10.controller !== undefined) {
            this.controller = q10.controller;
        }
        if (q10.cancel !== undefined) {
            this.cancel = q10.cancel;
        }
        if (q10.confirm !== undefined) {
            this.confirm = q10.confirm;
        }
        if (q10.openPrivacyPage !== undefined) {
            this.openPrivacyPage = q10.openPrivacyPage;
        }
    }
    updateStateVars(p10: PrivacyDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(o10) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller: CustomDialogController;
    setController(n10: CustomDialogController) {
        this.controller = n10;
    }
    private cancel: () => void;
    private confirm: () => void;
    private openPrivacyPage: () => void;
    initialRender() {
        this.observeComponentCreation2((l10, m10) => {
            Column.create();
            Column.width('90%');
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((j10, k10) => {
            Text.create('隐私政策与用户说明');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 24, bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((h10, i10) => {
            Scroll.create();
            Scroll.height(200);
            Scroll.margin({ left: 24, right: 24, bottom: 20 });
        }, Scroll);
        this.observeComponentCreation2((f10, g10) => {
            Text.create('欢迎使用“NJU课表导入”。\n\n在你使用本应用前，请先阅读并同意《隐私政策》。本应用主要提供南京大学课表导入系统日历功能。为实现该功能，本应用会在你主动操作时访问南京大学官方登录页面，并在获得你授权后申请日历权限，以便读取系统日历列表、写入课表事件以及清理本应用此前导入的数据。\n\n本应用不包含广告、不包含内购，也不会将你的账号、课表内容或日历数据上传到开发者自建服务器。相关数据仅在你的设备本地处理，并仅在访问南京大学官方系统时与学校服务器通信。');
            Text.fontSize(15);
            Text.fontColor('#666666');
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        Scroll.pop();
        this.observeComponentCreation2((d10, e10) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceEvenly);
            Row.margin({ bottom: 16 });
        }, Row);
        this.observeComponentCreation2((b10, c10) => {
            Button.createWithLabel('暂不同意');
            Button.backgroundColor(Color.Transparent);
            Button.fontColor('#999999');
            Button.onClick(() => {
                this.controller.close();
                this.cancel();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((z9, a10) => {
            Button.createWithLabel('查看政策');
            Button.backgroundColor(Color.Transparent);
            Button.fontColor('#007DFF');
            Button.onClick(() => {
                this.openPrivacyPage();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((x9, y9) => {
            Button.createWithLabel('同意并继续');
            Button.backgroundColor('#007DFF');
            Button.fontColor(Color.White);
            Button.onClick(() => {
                this.controller.close();
                this.confirm();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class Index extends ViewPU {
    constructor(l9, m9, n9, o9 = -1, p9 = undefined, q9) {
        super(l9, n9, o9, q9);
        if (typeof p9 === "function") {
            this.paramsGenerator_ = p9;
        }
        this.context = undefined;
        this.loginWebController = new webview.WebviewController();
        this.__privacyAccepted = new ObservedPropertySimplePU(false, this, "privacyAccepted");
        this.__isReady = new ObservedPropertySimplePU(false, this, "isReady");
        this.__schoolType = new ObservedPropertySimplePU(SchoolType.UNDERGRAD, this, "schoolType");
        this.__usernameHint = new ObservedPropertySimplePU('', this, "usernameHint");
        this.__session = new ObservedPropertyObjectPU(undefined, this, "session");
        this.__bundle = new ObservedPropertyObjectPU(undefined, this, "bundle");
        this.__calendars = new ObservedPropertyObjectPU([], this, "calendars");
        this.__selectedCalendarIndex = new ObservedPropertySimplePU(-1, this, "selectedCalendarIndex");
        this.__includeFinalExams = new ObservedPropertySimplePU(true, this, "includeFinalExams");
        this.__overwritePreviousImports = new ObservedPropertySimplePU(true, this, "overwritePreviousImports");
        this.__loadingSchedule = new ObservedPropertySimplePU(false, this, "loadingSchedule");
        this.__loadingCalendars = new ObservedPropertySimplePU(false, this, "loadingCalendars");
        this.__syncingCalendar = new ObservedPropertySimplePU(false, this, "syncingCalendar");
        this.__deletingImported = new ObservedPropertySimplePU(false, this, "deletingImported");
        this.__showLoginPanel = new ObservedPropertySimplePU(false, this, "showLoginPanel");
        this.__savingLoginState = new ObservedPropertySimplePU(false, this, "savingLoginState");
        this.__webCurrentUrl = new ObservedPropertySimplePU('', this, "webCurrentUrl");
        this.__loginHintText = new ObservedPropertySimplePU('请在下方网页中完成统一认证登录，并确保已经真正进入课表应用首页。', this, "loginHintText");
        this.dialogController = new CustomDialogController({
            builder: () => {
                let r9 = new PrivacyDialog(this, {
                    cancel: () => {
                        this.privacyAccepted = false;
                    },
                    confirm: async () => {
                        this.privacyAccepted = true;
                        if (this.context) {
                            try {
                                let w9 = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
                                await w9.put('privacyAccepted', true);
                                await w9.flush();
                            }
                            catch (v9) {
                                console.error('Save privacy state failed', v9);
                            }
                        }
                        this.initSession();
                    },
                    openPrivacyPage: () => {
                        router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 101, col: 14 });
                r9.setController(this.
                    dialogController);
                ViewPU.create(r9);
                let s9 = () => {
                    return {
                        cancel: () => {
                            this.privacyAccepted = false;
                        },
                        confirm: async () => {
                            this.privacyAccepted = true;
                            if (this.context) {
                                try {
                                    let u9 = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
                                    await u9.put('privacyAccepted', true);
                                    await u9.flush();
                                }
                                catch (t9) {
                                    console.error('Save privacy state failed', t9);
                                }
                            }
                            this.initSession();
                        },
                        openPrivacyPage: () => {
                            router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
                        }
                    };
                };
                r9.paramsGenerator_ = s9;
            },
            autoCancel: false,
            alignment: DialogAlignment.Center
        }, this);
        this.setInitiallyProvidedValue(m9);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(k9: Index_Params) {
        if (k9.context !== undefined) {
            this.context = k9.context;
        }
        if (k9.loginWebController !== undefined) {
            this.loginWebController = k9.loginWebController;
        }
        if (k9.privacyAccepted !== undefined) {
            this.privacyAccepted = k9.privacyAccepted;
        }
        if (k9.isReady !== undefined) {
            this.isReady = k9.isReady;
        }
        if (k9.schoolType !== undefined) {
            this.schoolType = k9.schoolType;
        }
        if (k9.usernameHint !== undefined) {
            this.usernameHint = k9.usernameHint;
        }
        if (k9.session !== undefined) {
            this.session = k9.session;
        }
        if (k9.bundle !== undefined) {
            this.bundle = k9.bundle;
        }
        if (k9.calendars !== undefined) {
            this.calendars = k9.calendars;
        }
        if (k9.selectedCalendarIndex !== undefined) {
            this.selectedCalendarIndex = k9.selectedCalendarIndex;
        }
        if (k9.includeFinalExams !== undefined) {
            this.includeFinalExams = k9.includeFinalExams;
        }
        if (k9.overwritePreviousImports !== undefined) {
            this.overwritePreviousImports = k9.overwritePreviousImports;
        }
        if (k9.loadingSchedule !== undefined) {
            this.loadingSchedule = k9.loadingSchedule;
        }
        if (k9.loadingCalendars !== undefined) {
            this.loadingCalendars = k9.loadingCalendars;
        }
        if (k9.syncingCalendar !== undefined) {
            this.syncingCalendar = k9.syncingCalendar;
        }
        if (k9.deletingImported !== undefined) {
            this.deletingImported = k9.deletingImported;
        }
        if (k9.showLoginPanel !== undefined) {
            this.showLoginPanel = k9.showLoginPanel;
        }
        if (k9.savingLoginState !== undefined) {
            this.savingLoginState = k9.savingLoginState;
        }
        if (k9.webCurrentUrl !== undefined) {
            this.webCurrentUrl = k9.webCurrentUrl;
        }
        if (k9.loginHintText !== undefined) {
            this.loginHintText = k9.loginHintText;
        }
        if (k9.dialogController !== undefined) {
            this.dialogController = k9.dialogController;
        }
    }
    updateStateVars(j9: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(i9) {
        this.__privacyAccepted.purgeDependencyOnElmtId(i9);
        this.__isReady.purgeDependencyOnElmtId(i9);
        this.__schoolType.purgeDependencyOnElmtId(i9);
        this.__usernameHint.purgeDependencyOnElmtId(i9);
        this.__session.purgeDependencyOnElmtId(i9);
        this.__bundle.purgeDependencyOnElmtId(i9);
        this.__calendars.purgeDependencyOnElmtId(i9);
        this.__selectedCalendarIndex.purgeDependencyOnElmtId(i9);
        this.__includeFinalExams.purgeDependencyOnElmtId(i9);
        this.__overwritePreviousImports.purgeDependencyOnElmtId(i9);
        this.__loadingSchedule.purgeDependencyOnElmtId(i9);
        this.__loadingCalendars.purgeDependencyOnElmtId(i9);
        this.__syncingCalendar.purgeDependencyOnElmtId(i9);
        this.__deletingImported.purgeDependencyOnElmtId(i9);
        this.__showLoginPanel.purgeDependencyOnElmtId(i9);
        this.__savingLoginState.purgeDependencyOnElmtId(i9);
        this.__webCurrentUrl.purgeDependencyOnElmtId(i9);
        this.__loginHintText.purgeDependencyOnElmtId(i9);
    }
    aboutToBeDeleted() {
        this.__privacyAccepted.aboutToBeDeleted();
        this.__isReady.aboutToBeDeleted();
        this.__schoolType.aboutToBeDeleted();
        this.__usernameHint.aboutToBeDeleted();
        this.__session.aboutToBeDeleted();
        this.__bundle.aboutToBeDeleted();
        this.__calendars.aboutToBeDeleted();
        this.__selectedCalendarIndex.aboutToBeDeleted();
        this.__includeFinalExams.aboutToBeDeleted();
        this.__overwritePreviousImports.aboutToBeDeleted();
        this.__loadingSchedule.aboutToBeDeleted();
        this.__loadingCalendars.aboutToBeDeleted();
        this.__syncingCalendar.aboutToBeDeleted();
        this.__deletingImported.aboutToBeDeleted();
        this.__showLoginPanel.aboutToBeDeleted();
        this.__savingLoginState.aboutToBeDeleted();
        this.__webCurrentUrl.aboutToBeDeleted();
        this.__loginHintText.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private context: common.UIAbilityContext | undefined;
    private loginWebController: webview.WebviewController;
    private __privacyAccepted: ObservedPropertySimplePU<boolean>;
    get privacyAccepted() {
        return this.__privacyAccepted.get();
    }
    set privacyAccepted(h9: boolean) {
        this.__privacyAccepted.set(h9);
    }
    private __isReady: ObservedPropertySimplePU<boolean>;
    get isReady() {
        return this.__isReady.get();
    }
    set isReady(g9: boolean) {
        this.__isReady.set(g9);
    }
    private __schoolType: ObservedPropertySimplePU<SchoolType>;
    get schoolType() {
        return this.__schoolType.get();
    }
    set schoolType(f9: SchoolType) {
        this.__schoolType.set(f9);
    }
    private __usernameHint: ObservedPropertySimplePU<string>;
    get usernameHint() {
        return this.__usernameHint.get();
    }
    set usernameHint(e9: string) {
        this.__usernameHint.set(e9);
    }
    private __session: ObservedPropertyObjectPU<SessionInfo | undefined>;
    get session() {
        return this.__session.get();
    }
    set session(d9: SessionInfo | undefined) {
        this.__session.set(d9);
    }
    private __bundle: ObservedPropertyObjectPU<ScheduleBundle | undefined>;
    get bundle() {
        return this.__bundle.get();
    }
    set bundle(c9: ScheduleBundle | undefined) {
        this.__bundle.set(c9);
    }
    private __calendars: ObservedPropertyObjectPU<CalendarOption[]>;
    get calendars() {
        return this.__calendars.get();
    }
    set calendars(b9: CalendarOption[]) {
        this.__calendars.set(b9);
    }
    private __selectedCalendarIndex: ObservedPropertySimplePU<number>;
    get selectedCalendarIndex() {
        return this.__selectedCalendarIndex.get();
    }
    set selectedCalendarIndex(a9: number) {
        this.__selectedCalendarIndex.set(a9);
    }
    private __includeFinalExams: ObservedPropertySimplePU<boolean>;
    get includeFinalExams() {
        return this.__includeFinalExams.get();
    }
    set includeFinalExams(z8: boolean) {
        this.__includeFinalExams.set(z8);
    }
    private __overwritePreviousImports: ObservedPropertySimplePU<boolean>;
    get overwritePreviousImports() {
        return this.__overwritePreviousImports.get();
    }
    set overwritePreviousImports(y8: boolean) {
        this.__overwritePreviousImports.set(y8);
    }
    private __loadingSchedule: ObservedPropertySimplePU<boolean>;
    get loadingSchedule() {
        return this.__loadingSchedule.get();
    }
    set loadingSchedule(x8: boolean) {
        this.__loadingSchedule.set(x8);
    }
    private __loadingCalendars: ObservedPropertySimplePU<boolean>;
    get loadingCalendars() {
        return this.__loadingCalendars.get();
    }
    set loadingCalendars(w8: boolean) {
        this.__loadingCalendars.set(w8);
    }
    private __syncingCalendar: ObservedPropertySimplePU<boolean>;
    get syncingCalendar() {
        return this.__syncingCalendar.get();
    }
    set syncingCalendar(v8: boolean) {
        this.__syncingCalendar.set(v8);
    }
    private __deletingImported: ObservedPropertySimplePU<boolean>;
    get deletingImported() {
        return this.__deletingImported.get();
    }
    set deletingImported(u8: boolean) {
        this.__deletingImported.set(u8);
    }
    private __showLoginPanel: ObservedPropertySimplePU<boolean>;
    get showLoginPanel() {
        return this.__showLoginPanel.get();
    }
    set showLoginPanel(t8: boolean) {
        this.__showLoginPanel.set(t8);
    }
    private __savingLoginState: ObservedPropertySimplePU<boolean>;
    get savingLoginState() {
        return this.__savingLoginState.get();
    }
    set savingLoginState(s8: boolean) {
        this.__savingLoginState.set(s8);
    }
    private __webCurrentUrl: ObservedPropertySimplePU<string>;
    get webCurrentUrl() {
        return this.__webCurrentUrl.get();
    }
    set webCurrentUrl(r8: string) {
        this.__webCurrentUrl.set(r8);
    }
    private __loginHintText: ObservedPropertySimplePU<string>;
    get loginHintText() {
        return this.__loginHintText.get();
    }
    set loginHintText(q8: string) {
        this.__loginHintText.set(q8);
    }
    private dialogController: CustomDialogController;
    aboutToAppear(): void {
        this.context = this.getUIContext().getHostContext() as common.UIAbilityContext;
        try {
            webview.WebviewController.setWebDebuggingAccess(true);
        }
        catch (p8) {
            console.error(`setWebDebuggingAccess failed: ${JSON.stringify(p8)}`);
        }
        this.checkPrivacyStatus();
    }
    private async checkPrivacyStatus() {
        if (this.context === undefined)
            return;
        try {
            let o8 = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
            this.privacyAccepted = (await o8.get('privacyAccepted', false)) as boolean;
        }
        catch (n8) {
            this.privacyAccepted = false;
        }
        this.isReady = true;
        if (!this.privacyAccepted) {
            this.dialogController.open();
        }
        else {
            this.initSession();
        }
    }
    private initSession() {
        if (this.context !== undefined) {
            let m8 = AuthService.restoreSession(this.context);
            if (m8 !== undefined) {
                this.session = m8;
                this.schoolType = m8.schoolType;
                if (m8.usernameHint !== '已登录用户') {
                    this.usernameHint = m8.usernameHint;
                }
            }
        }
    }
    private toast(l8: string): void {
        promptAction.showToast({ message: l8, duration: 2000 });
    }
    private formatDateTime(e8: number): string {
        let f8 = new Date(e8);
        let g8 = f8.getFullYear();
        let h8 = `${f8.getMonth() + 1}`.padStart(2, '0');
        let i8 = `${f8.getDate()}`.padStart(2, '0');
        let j8 = `${f8.getHours()}`.padStart(2, '0');
        let k8 = `${f8.getMinutes()}`.padStart(2, '0');
        return `${g8}-${h8}-${i8} ${j8}:${k8}`;
    }
    private previewEvents(): CourseEvent[] {
        if (this.bundle === undefined) {
            return [];
        }
        let b8: CourseEvent[] = [];
        let c8 = Math.min(this.bundle.events.length, 12);
        for (let d8 = 0; d8 < c8; d8++) {
            b8.push(this.bundle.events[d8]);
        }
        return b8;
    }
    private currentCalendar(): CalendarOption | undefined {
        if (this.selectedCalendarIndex < 0 || this.selectedCalendarIndex >= this.calendars.length) {
            return undefined;
        }
        return this.calendars[this.selectedCalendarIndex];
    }
    private async openLoginPanel(): Promise<void> {
        this.showLoginPanel = true;
        this.webCurrentUrl = '';
        this.loginHintText = '请在下方网页中完成统一认证登录，并确保已经真正进入课表应用首页。';
    }
    private async saveLoginState(): Promise<void> {
        if (this.context === undefined) {
            this.toast('上下文未初始化。');
            return;
        }
        this.savingLoginState = true;
        try {
            let a8 = await AuthService.captureSessionFromWebView(this.context, this.schoolType, this.usernameHint);
            this.session = a8;
            this.bundle = undefined;
            this.calendars = [];
            this.selectedCalendarIndex = -1;
            this.showLoginPanel = false;
            this.toast('登录成功，已保存登录态。');
        }
        catch (z7) {
            this.toast(`保存登录态失败：${String(z7)}`);
        }
        finally {
            this.savingLoginState = false;
        }
    }
    private async clearSessionAndCookies(): Promise<void> {
        if (this.context === undefined) {
            return;
        }
        await AuthService.clearSession(this.context);
        await AuthService.clearWebCookies();
        this.session = undefined;
        this.bundle = undefined;
        this.calendars = [];
        this.selectedCalendarIndex = -1;
        this.toast('已清空登录态和 Web Cookie。');
    }
    private async loadSchedule(): Promise<void> {
        if (this.session === undefined) {
            this.toast('请先完成网页登录。');
            return;
        }
        this.loadingSchedule = true;
        try {
            let x7 = SchoolTypeHelper.supportsFinalExams(this.session.schoolType) ? this.includeFinalExams : false;
            let y7 = await NjuScheduleService.fetchCurrentSemesterSchedule(this.session, x7);
            this.bundle = y7;
            this.toast(`已拉取 ${y7.events.length} 条日历事件。`);
        }
        catch (w7) {
            this.toast(`拉取课表失败：${String(w7)}`);
        }
        finally {
            this.loadingSchedule = false;
        }
    }
    private async loadCalendars(): Promise<void> {
        if (this.context === undefined) {
            return;
        }
        this.loadingCalendars = true;
        try {
            let v7 = await CalendarSyncService.listWritableCalendars(this.context);
            this.calendars = v7;
            this.selectedCalendarIndex = v7.length > 0 ? 0 : -1;
            if (v7.length === 0) {
                this.toast('当前没有可用的系统日历，你可以创建一个应用专用日历。');
            }
            else {
                this.toast(`已加载 ${v7.length} 个日历。`);
            }
        }
        catch (u7) {
            this.toast(`加载系统日历失败：${String(u7)}`);
        }
        finally {
            this.loadingCalendars = false;
        }
    }
    private async createAppCalendar(): Promise<void> {
        if (this.context === undefined) {
            return;
        }
        try {
            let s7 = await CalendarSyncService.createOrGetAppCalendar(this.context);
            await this.loadCalendars();
            for (let t7 = 0; t7 < this.calendars.length; t7++) {
                if (this.calendars[t7].name === s7.name) {
                    this.selectedCalendarIndex = t7;
                    break;
                }
            }
            this.toast('已准备好应用专用日历。');
        }
        catch (r7) {
            this.toast(`创建应用专用日历失败：${String(r7)}`);
        }
    }
    private async syncToCalendar(): Promise<void> {
        let n7 = this.currentCalendar();
        if (this.bundle === undefined) {
            this.toast('请先拉取课表。');
            return;
        }
        if (n7 === undefined || n7.calendar === undefined) {
            this.toast('请先选择一个目标日历。');
            return;
        }
        this.syncingCalendar = true;
        try {
            let p7 = await CalendarSyncService.syncEvents(n7.calendar, this.bundle, this.overwritePreviousImports);
            let q7 = p7.warning.length > 0 ? ` ${p7.warning}` : '';
            this.toast(`同步完成：新增 ${p7.created}，删除 ${p7.deleted}，跳过 ${p7.skipped}。${q7}`);
        }
        catch (o7) {
            this.toast(`写入系统日历失败：${String(o7)}`);
        }
        finally {
            this.syncingCalendar = false;
        }
    }
    private async deleteImportedEvents(): Promise<void> {
        let k7 = this.currentCalendar();
        if (k7 === undefined || k7.calendar === undefined) {
            this.toast('请先选择一个目标日历。');
            return;
        }
        this.deletingImported = true;
        try {
            let m7 = await CalendarSyncService.deleteImportedEvents(k7.calendar);
            this.toast(`已删除 ${m7} 条由本应用导入的事件。`);
        }
        catch (l7) {
            this.toast(`清空失败：${String(l7)}`);
        }
        finally {
            this.deletingImported = false;
        }
    }
    PrivacyBlockedView(z6 = null) {
        this.observeComponentCreation2((i7, j7) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((g7, h7) => {
            Image.create({ "id": 16777217, "type": 20000, params: [], "bundleName": "com.mc121.njucalendarimporter", "moduleName": "entry" });
            Image.width(80);
            Image.height(80);
            Image.margin({ bottom: 20 });
            Image.opacity(0.5);
        }, Image);
        this.observeComponentCreation2((e7, f7) => {
            Text.create('请先阅读并同意隐私政策');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((c7, d7) => {
            Text.create('在你同意隐私政策前，本应用不会继续读取本地登录态，也不会申请日历权限或提供课表导入功能。');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.textAlign(TextAlign.Center);
            Text.padding({ left: 32, right: 32 });
            Text.lineHeight(20);
            Text.margin({ bottom: 32 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((a7, b7) => {
            Button.createWithLabel('查看并同意隐私政策');
            Button.width('80%');
            Button.onClick(() => {
                this.dialogController.open();
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    MainContent(a2 = null) {
        this.observeComponentCreation2((x6, y6) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((v6, w6) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((t6, u6) => {
            Text.create('南大课表导入日历');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((r6, s6) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((p6, q6) => {
            Text.create('隐私政策');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.margin({ right: 6 });
            Text.onClick(() => {
                router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((n6, o6) => {
            Scroll.create();
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((l6, m6) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((j6, k6) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((h6, i6) => {
            Text.create('说明');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((f6, g6) => {
            Text.create('1. 本项目旨在提供一个南京大学课表导入手机日历解决方案，供有需求的同学参考使用。');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((d6, e6) => {
            Text.create('2. 本项目完全免费开源，且不包含任何广告或内购；使用过程中也不会将课表数据上传到开发者自建服务器。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((b6, c6) => {
            Text.create('3. 本应用仅在你主动使用相关功能时访问南京大学官方系统，并在获得授权后申请日历权限。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((z5, a6) => {
            Text.create('4. 本项目由 mc_121 维护，邮箱 mc_121_@outlook.com。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((x5, y5) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((v5, w5) => {
            Text.create('登录');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((t5, u5) => {
            Text.create(`当前身份：${SchoolTypeHelper.shortLabel(this.schoolType)}`);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((r5, s5) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((p5, q5) => {
            Button.createWithLabel(this.schoolType === SchoolType.UNDERGRAD ? '本科生（当前）' : '切换为本科生');
            Button.onClick(() => {
                this.schoolType = SchoolType.UNDERGRAD;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((n5, o5) => {
            Blank.create();
            Blank.width(12);
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((l5, m5) => {
            Button.createWithLabel(this.schoolType === SchoolType.GRADUATE ? '研究生（当前）' : '切换为研究生');
            Button.onClick(() => {
                this.schoolType = SchoolType.GRADUATE;
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((i5, j5) => {
            TextInput.create({ text: this.usernameHint, placeholder: '备注用户名（可选，仅本地显示）' });
            TextInput.onChange((k5: string) => {
                this.usernameHint = k5;
            });
            TextInput.margin({ top: 12 });
        }, TextInput);
        this.observeComponentCreation2((a5, b5) => {
            If.create();
            if (this.session === undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((g5, h5) => {
                        Button.createWithLabel('打开统一认证网页登录');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.openLoginPanel();
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((e5, f5) => {
                        Text.create(`当前登录态：${SchoolTypeHelper.label(this.session.schoolType)} / ${this.session.usernameHint}`);
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((c5, d5) => {
                        Button.createWithLabel('清除登录态并重登');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.clearSessionAndCookies();
                        });
                    }, Button);
                    Button.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((o4, p4) => {
            If.create();
            if (this.session !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((y4, z4) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((w4, x4) => {
                        Text.create('拉取课表');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((s4, t4) => {
                        If.create();
                        if (SchoolTypeHelper.supportsFinalExams(this.session.schoolType)) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((u4, v4) => {
                                    Button.createWithLabel(this.includeFinalExams ? '期末考试：已包含' : '期末考试：未包含');
                                    Button.width('100%');
                                    Button.margin({ top: 12 });
                                    Button.onClick(() => {
                                        this.includeFinalExams = !this.includeFinalExams;
                                    });
                                }, Button);
                                Button.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((q4, r4) => {
                        Button.createWithLabel(this.loadingSchedule ? '正在拉取课表…' : '拉取当前学期课表');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            if (!this.loadingSchedule) {
                                this.loadSchedule();
                            }
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((b2, c2) => {
            If.create();
            if (this.bundle !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((m4, n4) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((k4, l4) => {
                        Text.create('课表预览');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((i4, j4) => {
                        Text.create(`学期：${this.bundle.semesterName}`);
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((g4, h4) => {
                        Text.create(`课程数：${this.bundle.courseCount}    考试数：${this.bundle.examCount}    事件总数：${this.bundle.events.length}`);
                        Text.margin({ top: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((q3, r3) => {
                        ForEach.create();
                        const s3 = u3 => {
                            const v3 = u3;
                            this.observeComponentCreation2((e4, f4) => {
                                Column.create();
                                Column.width('100%');
                                Column.padding({ top: 10, bottom: 10 });
                                Column.border({
                                    width: { bottom: 1 },
                                    color: '#EFEFEF'
                                });
                            }, Column);
                            this.observeComponentCreation2((c4, d4) => {
                                Text.create(v3.title);
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Medium);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((a4, b4) => {
                                Text.create(`${this.formatDateTime(v3.startTime)} - ${this.formatDateTime(v3.endTime)}`);
                                Text.fontSize(12);
                                Text.fontColor('#666666');
                                Text.margin({ top: 4 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((w3, x3) => {
                                If.create();
                                if (v3.location.length > 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((y3, z3) => {
                                            Text.create(v3.location);
                                            Text.fontSize(12);
                                            Text.fontColor('#666666');
                                            Text.margin({ top: 2 });
                                        }, Text);
                                        Text.pop();
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
                                    });
                                }
                            }, If);
                            If.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(q3, this.previewEvents(), s3, (t3: CourseEvent) => t3.importKey, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    this.observeComponentCreation2((o3, p3) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12, bottom: 16 });
                    }, Column);
                    this.observeComponentCreation2((m3, n3) => {
                        Text.create('系统日历同步');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((k3, l3) => {
                        Button.createWithLabel(this.overwritePreviousImports ? '覆盖删除旧导入：开启' : '覆盖删除旧导入：关闭');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.overwritePreviousImports = !this.overwritePreviousImports;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((i3, j3) => {
                        Button.createWithLabel(this.loadingCalendars ? '正在加载日历…' : '加载系统日历');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            if (!this.loadingCalendars) {
                                this.loadCalendars();
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((g3, h3) => {
                        Button.createWithLabel('创建 / 获取应用专用日历');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.createAppCalendar();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((h2, i2) => {
                        If.create();
                        if (this.calendars.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((e3, f3) => {
                                    Text.create('选择目标日历');
                                    Text.fontSize(16);
                                    Text.fontWeight(FontWeight.Medium);
                                    Text.margin({ top: 14 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((j2, k2) => {
                                    ForEach.create();
                                    const l2 = (n2, o2: number) => {
                                        const p2 = n2;
                                        this.observeComponentCreation2((c3, d3) => {
                                            Row.create();
                                            Row.width('100%');
                                            Row.padding({ top: 10, bottom: 10 });
                                            Row.border({
                                                width: { bottom: 1 },
                                                color: '#EFEFEF'
                                            });
                                            Row.onClick(() => {
                                                this.selectedCalendarIndex = o2;
                                            });
                                        }, Row);
                                        this.observeComponentCreation2((a3, b3) => {
                                            Text.create(this.selectedCalendarIndex === o2 ? '●' : '○');
                                            Text.fontSize(18);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((y2, z2) => {
                                            Column.create();
                                            Column.margin({ left: 10 });
                                        }, Column);
                                        this.observeComponentCreation2((w2, x2) => {
                                            Text.create(p2.name);
                                            Text.fontSize(15);
                                            Text.fontWeight(FontWeight.Medium);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((s2, t2) => {
                                            If.create();
                                            if (p2.subTitle.length > 0) {
                                                this.ifElseBranchUpdateFunction(0, () => {
                                                    this.observeComponentCreation2((u2, v2) => {
                                                        Text.create(p2.subTitle);
                                                        Text.fontSize(12);
                                                        Text.fontColor('#666666');
                                                        Text.margin({ top: 2 });
                                                    }, Text);
                                                    Text.pop();
                                                });
                                            }
                                            else {
                                                this.ifElseBranchUpdateFunction(1, () => {
                                                });
                                            }
                                        }, If);
                                        If.pop();
                                        Column.pop();
                                        this.observeComponentCreation2((q2, r2) => {
                                            Blank.create();
                                        }, Blank);
                                        Blank.pop();
                                        Row.pop();
                                    };
                                    this.forEachUpdateFunction(j2, this.calendars, l2, (m2: CalendarOption) => m2.id, true, false);
                                }, ForEach);
                                ForEach.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((f2, g2) => {
                        Button.createWithLabel(this.syncingCalendar ? '正在写入系统日历…' : '写入系统日历');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            if (!this.syncingCalendar) {
                                this.syncToCalendar();
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((d2, e2) => {
                        Button.createWithLabel(this.deletingImported ? '正在清空导入事件…' : '一键清空本应用导入事件');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            if (!this.deletingImported) {
                                this.deleteImportedEvents();
                            }
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((y1, z1) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
            Stack.backgroundColor('#F5F6FA');
        }, Stack);
        this.observeComponentCreation2((s1, t1) => {
            If.create();
            if (!this.isReady) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((w1, x1) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((u1, v1) => {
                        LoadingProgress.create();
                        LoadingProgress.width(64);
                        LoadingProgress.height(64);
                    }, LoadingProgress);
                    Column.pop();
                });
            }
            else if (!this.privacyAccepted) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.PrivacyBlockedView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.MainContent.bind(this)();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((p, q) => {
            If.create();
            if (this.showLoginPanel) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((q1, r1) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#F5F6FA');
                    }, Column);
                    this.observeComponentCreation2((o1, p1) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((m1, n1) => {
                        Text.create('统一认证网页登录');
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((k1, l1) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((i1, j1) => {
                        Button.createWithLabel('关闭');
                        Button.onClick(() => {
                            this.showLoginPanel = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((g1, h1) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ left: 16, right: 16 });
                    }, Column);
                    this.observeComponentCreation2((e1, f1) => {
                        Text.create(this.loginHintText);
                        Text.fontSize(13);
                        Text.fontColor('#555555');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((a1, b1) => {
                        If.create();
                        if (this.webCurrentUrl.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((c1, d1) => {
                                    Text.create(`当前网址：${this.webCurrentUrl}`);
                                    Text.fontSize(11);
                                    Text.fontColor('#777777');
                                    Text.margin({ top: 8 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                    this.observeComponentCreation2((v, w) => {
                        Web.create({ src: 'about:blank', controller: this.loginWebController });
                        Web.width('100%');
                        Web.height('65%');
                        Web.margin({ top: 12, left: 16, right: 16 });
                        Web.backgroundColor(Color.White);
                        Web.onControllerAttached(() => {
                            try {
                                this.loginWebController.setCustomUserAgent(HttpService.browserUserAgent);
                            }
                            catch (z) {
                                console.error(`setCustomUserAgent failed: ${JSON.stringify(z)}`);
                            }
                            this.loginWebController.loadUrl(AuthService.buildWebLoginEntryUrl(this.schoolType));
                        });
                        Web.onPageBegin((y) => {
                            if (y) {
                                this.webCurrentUrl = y.url;
                            }
                        });
                        Web.onPageEnd((x) => {
                            if (x) {
                                this.webCurrentUrl = x.url;
                                if (x.url.includes('index.do')) {
                                    this.loginHintText = '检测到你可能已经进入课表首页。现在可以点击下方按钮保存登录态。';
                                }
                            }
                        });
                        Web.javaScriptAccess(true);
                        Web.domStorageAccess(true);
                    }, Web);
                    this.observeComponentCreation2((t, u) => {
                        Button.createWithLabel(this.savingLoginState ? '正在保存登录态…' : '我已进入课表应用首页，保存登录态');
                        Button.width('100%');
                        Button.margin({ top: 12, left: 16, right: 16 });
                        Button.onClick(() => {
                            if (!this.savingLoginState) {
                                this.saveLoginState();
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((r, s) => {
                        Button.createWithLabel('清空网页 Cookie 后重新登录');
                        Button.width('100%');
                        Button.margin({ top: 12, left: 16, right: 16 });
                        Button.onClick(() => {
                            AuthService.clearWebCookies();
                            this.loginWebController.loadUrl(AuthService.buildWebLoginEntryUrl(this.schoolType));
                            this.loginHintText = '已清空 Cookie，请重新完成网页登录。';
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.mc121.njucalendarimporter", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
