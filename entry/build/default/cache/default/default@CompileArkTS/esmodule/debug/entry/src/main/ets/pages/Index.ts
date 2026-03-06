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
    // 注册弹窗控制器
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
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.cancel = () => { };
        this.confirm = () => { };
        this.openPrivacyPage = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PrivacyDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.cancel !== undefined) {
            this.cancel = params.cancel;
        }
        if (params.confirm !== undefined) {
            this.confirm = params.confirm;
        }
        if (params.openPrivacyPage !== undefined) {
            this.openPrivacyPage = params.openPrivacyPage;
        }
    }
    updateStateVars(params: PrivacyDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private cancel: () => void;
    private confirm: () => void;
    private openPrivacyPage: () => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('90%');
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('隐私政策与用户说明');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 24, bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.height(200);
            Scroll.margin({ left: 24, right: 24, bottom: 20 });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('欢迎使用“NJU课表导入”。\n\n在你使用本应用前，请先阅读并同意《隐私政策》。本应用主要提供南京大学课表导入系统日历功能。为实现该功能，本应用会在你主动操作时访问南京大学官方登录页面，并在获得你授权后申请日历权限，以便读取系统日历列表、写入课表事件以及清理本应用此前导入的数据。\n\n本应用不包含广告、不包含内购，也不会将你的账号、课表内容或日历数据上传到开发者自建服务器。相关数据仅在你的设备本地处理，并仅在访问南京大学官方系统时与学校服务器通信。');
            Text.fontSize(15);
            Text.fontColor('#666666');
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceEvenly);
            Row.margin({ bottom: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('暂不同意');
            Button.backgroundColor(Color.Transparent);
            Button.fontColor('#999999');
            Button.onClick(() => {
                this.controller.close();
                this.cancel();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('查看政策');
            Button.backgroundColor(Color.Transparent);
            Button.fontColor('#007DFF');
            Button.onClick(() => {
                this.openPrivacyPage();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
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
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
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
                let jsDialog = new PrivacyDialog(this, {
                    cancel: () => {
                        this.privacyAccepted = false;
                    },
                    confirm: async () => {
                        this.privacyAccepted = true;
                        // 存入底层缓存，下次不再弹窗
                        if (this.context) {
                            try {
                                let prefs = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
                                await prefs.put('privacyAccepted', true);
                                await prefs.flush();
                            }
                            catch (e) {
                                console.error('Save privacy state failed', e);
                            }
                        }
                        this.initSession(); // 同意后初始化登录态
                    },
                    openPrivacyPage: () => {
                        router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 101, col: 14 });
                jsDialog.setController(this.
                // 注册弹窗控制器
                dialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        cancel: () => {
                            this.privacyAccepted = false;
                        },
                        confirm: async () => {
                            this.privacyAccepted = true;
                            // 存入底层缓存，下次不再弹窗
                            if (this.context) {
                                try {
                                    let prefs = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
                                    await prefs.put('privacyAccepted', true);
                                    await prefs.flush();
                                }
                                catch (e) {
                                    console.error('Save privacy state failed', e);
                                }
                            }
                            this.initSession(); // 同意后初始化登录态
                        },
                        openPrivacyPage: () => {
                            router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: false,
            alignment: DialogAlignment.Center
        }, this);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.loginWebController !== undefined) {
            this.loginWebController = params.loginWebController;
        }
        if (params.privacyAccepted !== undefined) {
            this.privacyAccepted = params.privacyAccepted;
        }
        if (params.isReady !== undefined) {
            this.isReady = params.isReady;
        }
        if (params.schoolType !== undefined) {
            this.schoolType = params.schoolType;
        }
        if (params.usernameHint !== undefined) {
            this.usernameHint = params.usernameHint;
        }
        if (params.session !== undefined) {
            this.session = params.session;
        }
        if (params.bundle !== undefined) {
            this.bundle = params.bundle;
        }
        if (params.calendars !== undefined) {
            this.calendars = params.calendars;
        }
        if (params.selectedCalendarIndex !== undefined) {
            this.selectedCalendarIndex = params.selectedCalendarIndex;
        }
        if (params.includeFinalExams !== undefined) {
            this.includeFinalExams = params.includeFinalExams;
        }
        if (params.overwritePreviousImports !== undefined) {
            this.overwritePreviousImports = params.overwritePreviousImports;
        }
        if (params.loadingSchedule !== undefined) {
            this.loadingSchedule = params.loadingSchedule;
        }
        if (params.loadingCalendars !== undefined) {
            this.loadingCalendars = params.loadingCalendars;
        }
        if (params.syncingCalendar !== undefined) {
            this.syncingCalendar = params.syncingCalendar;
        }
        if (params.deletingImported !== undefined) {
            this.deletingImported = params.deletingImported;
        }
        if (params.showLoginPanel !== undefined) {
            this.showLoginPanel = params.showLoginPanel;
        }
        if (params.savingLoginState !== undefined) {
            this.savingLoginState = params.savingLoginState;
        }
        if (params.webCurrentUrl !== undefined) {
            this.webCurrentUrl = params.webCurrentUrl;
        }
        if (params.loginHintText !== undefined) {
            this.loginHintText = params.loginHintText;
        }
        if (params.dialogController !== undefined) {
            this.dialogController = params.dialogController;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__privacyAccepted.purgeDependencyOnElmtId(rmElmtId);
        this.__isReady.purgeDependencyOnElmtId(rmElmtId);
        this.__schoolType.purgeDependencyOnElmtId(rmElmtId);
        this.__usernameHint.purgeDependencyOnElmtId(rmElmtId);
        this.__session.purgeDependencyOnElmtId(rmElmtId);
        this.__bundle.purgeDependencyOnElmtId(rmElmtId);
        this.__calendars.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCalendarIndex.purgeDependencyOnElmtId(rmElmtId);
        this.__includeFinalExams.purgeDependencyOnElmtId(rmElmtId);
        this.__overwritePreviousImports.purgeDependencyOnElmtId(rmElmtId);
        this.__loadingSchedule.purgeDependencyOnElmtId(rmElmtId);
        this.__loadingCalendars.purgeDependencyOnElmtId(rmElmtId);
        this.__syncingCalendar.purgeDependencyOnElmtId(rmElmtId);
        this.__deletingImported.purgeDependencyOnElmtId(rmElmtId);
        this.__showLoginPanel.purgeDependencyOnElmtId(rmElmtId);
        this.__savingLoginState.purgeDependencyOnElmtId(rmElmtId);
        this.__webCurrentUrl.purgeDependencyOnElmtId(rmElmtId);
        this.__loginHintText.purgeDependencyOnElmtId(rmElmtId);
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
    // --- 隐私政策相关的状态 ---
    private __privacyAccepted: ObservedPropertySimplePU<boolean>;
    get privacyAccepted() {
        return this.__privacyAccepted.get();
    }
    set privacyAccepted(newValue: boolean) {
        this.__privacyAccepted.set(newValue);
    }
    private __isReady: ObservedPropertySimplePU<boolean>;
    get isReady() {
        return this.__isReady.get();
    }
    set isReady(newValue: boolean) {
        this.__isReady.set(newValue);
    }
    private __schoolType: ObservedPropertySimplePU<SchoolType>;
    get schoolType() {
        return this.__schoolType.get();
    }
    set schoolType(newValue: SchoolType) {
        this.__schoolType.set(newValue);
    }
    private __usernameHint: ObservedPropertySimplePU<string>;
    get usernameHint() {
        return this.__usernameHint.get();
    }
    set usernameHint(newValue: string) {
        this.__usernameHint.set(newValue);
    }
    private __session: ObservedPropertyObjectPU<SessionInfo | undefined>;
    get session() {
        return this.__session.get();
    }
    set session(newValue: SessionInfo | undefined) {
        this.__session.set(newValue);
    }
    private __bundle: ObservedPropertyObjectPU<ScheduleBundle | undefined>;
    get bundle() {
        return this.__bundle.get();
    }
    set bundle(newValue: ScheduleBundle | undefined) {
        this.__bundle.set(newValue);
    }
    private __calendars: ObservedPropertyObjectPU<CalendarOption[]>;
    get calendars() {
        return this.__calendars.get();
    }
    set calendars(newValue: CalendarOption[]) {
        this.__calendars.set(newValue);
    }
    private __selectedCalendarIndex: ObservedPropertySimplePU<number>;
    get selectedCalendarIndex() {
        return this.__selectedCalendarIndex.get();
    }
    set selectedCalendarIndex(newValue: number) {
        this.__selectedCalendarIndex.set(newValue);
    }
    private __includeFinalExams: ObservedPropertySimplePU<boolean>;
    get includeFinalExams() {
        return this.__includeFinalExams.get();
    }
    set includeFinalExams(newValue: boolean) {
        this.__includeFinalExams.set(newValue);
    }
    private __overwritePreviousImports: ObservedPropertySimplePU<boolean>;
    get overwritePreviousImports() {
        return this.__overwritePreviousImports.get();
    }
    set overwritePreviousImports(newValue: boolean) {
        this.__overwritePreviousImports.set(newValue);
    }
    private __loadingSchedule: ObservedPropertySimplePU<boolean>;
    get loadingSchedule() {
        return this.__loadingSchedule.get();
    }
    set loadingSchedule(newValue: boolean) {
        this.__loadingSchedule.set(newValue);
    }
    private __loadingCalendars: ObservedPropertySimplePU<boolean>;
    get loadingCalendars() {
        return this.__loadingCalendars.get();
    }
    set loadingCalendars(newValue: boolean) {
        this.__loadingCalendars.set(newValue);
    }
    private __syncingCalendar: ObservedPropertySimplePU<boolean>;
    get syncingCalendar() {
        return this.__syncingCalendar.get();
    }
    set syncingCalendar(newValue: boolean) {
        this.__syncingCalendar.set(newValue);
    }
    private __deletingImported: ObservedPropertySimplePU<boolean>;
    get deletingImported() {
        return this.__deletingImported.get();
    }
    set deletingImported(newValue: boolean) {
        this.__deletingImported.set(newValue);
    }
    private __showLoginPanel: ObservedPropertySimplePU<boolean>;
    get showLoginPanel() {
        return this.__showLoginPanel.get();
    }
    set showLoginPanel(newValue: boolean) {
        this.__showLoginPanel.set(newValue);
    }
    private __savingLoginState: ObservedPropertySimplePU<boolean>;
    get savingLoginState() {
        return this.__savingLoginState.get();
    }
    set savingLoginState(newValue: boolean) {
        this.__savingLoginState.set(newValue);
    }
    private __webCurrentUrl: ObservedPropertySimplePU<string>;
    get webCurrentUrl() {
        return this.__webCurrentUrl.get();
    }
    set webCurrentUrl(newValue: string) {
        this.__webCurrentUrl.set(newValue);
    }
    private __loginHintText: ObservedPropertySimplePU<string>;
    get loginHintText() {
        return this.__loginHintText.get();
    }
    set loginHintText(newValue: string) {
        this.__loginHintText.set(newValue);
    }
    // 注册弹窗控制器
    private dialogController: CustomDialogController;
    aboutToAppear(): void {
        this.context = this.getUIContext().getHostContext() as common.UIAbilityContext;
        try {
            webview.WebviewController.setWebDebuggingAccess(true);
        }
        catch (error) {
            console.error(`setWebDebuggingAccess failed: ${JSON.stringify(error)}`);
        }
        // 首先检查隐私协议状态
        this.checkPrivacyStatus();
    }
    private async checkPrivacyStatus() {
        if (this.context === undefined)
            return;
        try {
            let prefs = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
            this.privacyAccepted = (await prefs.get('privacyAccepted', false)) as boolean;
        }
        catch (e) {
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
            let restored = AuthService.restoreSession(this.context);
            if (restored !== undefined) {
                this.session = restored;
                this.schoolType = restored.schoolType;
                if (restored.usernameHint !== '已登录用户') {
                    this.usernameHint = restored.usernameHint;
                }
            }
        }
    }
    private toast(message: string): void {
        promptAction.showToast({ message: message, duration: 2000 });
    }
    private formatDateTime(timestamp: number): string {
        let date = new Date(timestamp);
        let year = date.getFullYear();
        let month = `${date.getMonth() + 1}`.padStart(2, '0');
        let day = `${date.getDate()}`.padStart(2, '0');
        let hour = `${date.getHours()}`.padStart(2, '0');
        let minute = `${date.getMinutes()}`.padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    private previewEvents(): CourseEvent[] {
        if (this.bundle === undefined) {
            return [];
        }
        let result: CourseEvent[] = [];
        let count = Math.min(this.bundle.events.length, 12);
        for (let i = 0; i < count; i++) {
            result.push(this.bundle.events[i]);
        }
        return result;
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
            let session = await AuthService.captureSessionFromWebView(this.context, this.schoolType, this.usernameHint);
            this.session = session;
            this.bundle = undefined;
            this.calendars = [];
            this.selectedCalendarIndex = -1;
            this.showLoginPanel = false;
            this.toast('登录成功，已保存登录态。');
        }
        catch (error) {
            this.toast(`保存登录态失败：${String(error)}`);
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
            let includeExams = SchoolTypeHelper.supportsFinalExams(this.session.schoolType) ? this.includeFinalExams : false;
            let bundle = await NjuScheduleService.fetchCurrentSemesterSchedule(this.session, includeExams);
            this.bundle = bundle;
            this.toast(`已拉取 ${bundle.events.length} 条日历事件。`);
        }
        catch (error) {
            this.toast(`拉取课表失败：${String(error)}`);
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
            let calendars = await CalendarSyncService.listWritableCalendars(this.context);
            this.calendars = calendars;
            this.selectedCalendarIndex = calendars.length > 0 ? 0 : -1;
            if (calendars.length === 0) {
                this.toast('当前没有可用的系统日历，你可以创建一个应用专用日历。');
            }
            else {
                this.toast(`已加载 ${calendars.length} 个日历。`);
            }
        }
        catch (error) {
            this.toast(`加载系统日历失败：${String(error)}`);
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
            let calendar = await CalendarSyncService.createOrGetAppCalendar(this.context);
            await this.loadCalendars();
            for (let i = 0; i < this.calendars.length; i++) {
                if (this.calendars[i].name === calendar.name) {
                    this.selectedCalendarIndex = i;
                    break;
                }
            }
            this.toast('已准备好应用专用日历。');
        }
        catch (error) {
            this.toast(`创建应用专用日历失败：${String(error)}`);
        }
    }
    private async syncToCalendar(): Promise<void> {
        let calendarOption = this.currentCalendar();
        if (this.bundle === undefined) {
            this.toast('请先拉取课表。');
            return;
        }
        if (calendarOption === undefined || calendarOption.calendar === undefined) {
            this.toast('请先选择一个目标日历。');
            return;
        }
        this.syncingCalendar = true;
        try {
            let result = await CalendarSyncService.syncEvents(calendarOption.calendar, this.bundle, this.overwritePreviousImports);
            let warning = result.warning.length > 0 ? ` ${result.warning}` : '';
            this.toast(`同步完成：新增 ${result.created}，删除 ${result.deleted}，跳过 ${result.skipped}。${warning}`);
        }
        catch (error) {
            this.toast(`写入系统日历失败：${String(error)}`);
        }
        finally {
            this.syncingCalendar = false;
        }
    }
    private async deleteImportedEvents(): Promise<void> {
        let calendarOption = this.currentCalendar();
        if (calendarOption === undefined || calendarOption.calendar === undefined) {
            this.toast('请先选择一个目标日历。');
            return;
        }
        this.deletingImported = true;
        try {
            let deleted = await CalendarSyncService.deleteImportedEvents(calendarOption.calendar);
            this.toast(`已删除 ${deleted} 条由本应用导入的事件。`);
        }
        catch (error) {
            this.toast(`清空失败：${String(error)}`);
        }
        finally {
            this.deletingImported = false;
        }
    }
    // === UI 构建区块 ===
    PrivacyBlockedView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 占位图标
            Image.create({ "id": 16777217, "type": 20000, params: [], "bundleName": "com.mc121.njucalendarimporter", "moduleName": "entry" });
            // 占位图标
            Image.width(80);
            // 占位图标
            Image.height(80);
            // 占位图标
            Image.margin({ bottom: 20 });
            // 占位图标
            Image.opacity(0.5);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('请先阅读并同意隐私政策');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('在你同意隐私政策前，本应用不会继续读取本地登录态，也不会申请日历权限或提供课表导入功能。');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.textAlign(TextAlign.Center);
            Text.padding({ left: 32, right: 32 });
            Text.lineHeight(20);
            Text.margin({ bottom: 32 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('查看并同意隐私政策');
            Button.width('80%');
            Button.onClick(() => {
                this.dialogController.open();
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    MainContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 自定义顶部 Header 栏，并在右上角加入隐私政策快捷入口
            Row.create();
            // 自定义顶部 Header 栏，并在右上角加入隐私政策快捷入口
            Row.width('100%');
            // 自定义顶部 Header 栏，并在右上角加入隐私政策快捷入口
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('南大课表导入日历');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 🚀 右上角的隐私政策入口
            Text.create('隐私政策');
            // 🚀 右上角的隐私政策入口
            Text.fontSize(14);
            // 🚀 右上角的隐私政策入口
            Text.fontColor('#007DFF');
            // 🚀 右上角的隐私政策入口
            Text.margin({ right: 6 });
            // 🚀 右上角的隐私政策入口
            Text.onClick(() => {
                router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
            });
        }, Text);
        // 🚀 右上角的隐私政策入口
        Text.pop();
        // 自定义顶部 Header 栏，并在右上角加入隐私政策快捷入口
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('说明');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('1. 本项目旨在提供一个南京大学课表导入手机日历解决方案，供有需求的同学参考使用。');
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('2. 本项目完全免费开源，且不包含任何广告或内购；使用过程中也不会将课表数据上传到开发者自建服务器。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('3. 本应用仅在你主动使用相关功能时访问南京大学官方系统，并在获得授权后申请日历权限。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('4. 本项目由 mc_121 维护，邮箱 mc_121_@outlook.com。');
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('登录');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`当前身份：${SchoolTypeHelper.shortLabel(this.schoolType)}`);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.schoolType === SchoolType.UNDERGRAD ? '本科生（当前）' : '切换为本科生');
            Button.onClick(() => {
                this.schoolType = SchoolType.UNDERGRAD;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.width(12);
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.schoolType === SchoolType.GRADUATE ? '研究生（当前）' : '切换为研究生');
            Button.onClick(() => {
                this.schoolType = SchoolType.GRADUATE;
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.usernameHint, placeholder: '备注用户名（可选，仅本地显示）' });
            TextInput.onChange((value: string) => {
                this.usernameHint = value;
            });
            TextInput.margin({ top: 12 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.session === undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`当前登录态：${SchoolTypeHelper.label(this.session.schoolType)} / ${this.session.usernameHint}`);
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.session !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('拉取课表');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (SchoolTypeHelper.supportsFinalExams(this.session.schoolType)) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.bundle !== undefined) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('课表预览');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`学期：${this.bundle.semesterName}`);
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`课程数：${this.bundle.courseCount}    考试数：${this.bundle.examCount}    事件总数：${this.bundle.events.length}`);
                        Text.margin({ top: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create();
                                Column.width('100%');
                                Column.padding({ top: 10, bottom: 10 });
                                Column.border({
                                    width: { bottom: 1 },
                                    color: '#EFEFEF'
                                });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(item.title);
                                Text.fontSize(15);
                                Text.fontWeight(FontWeight.Medium);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${this.formatDateTime(item.startTime)} - ${this.formatDateTime(item.endTime)}`);
                                Text.fontSize(12);
                                Text.fontColor('#666666');
                                Text.margin({ top: 4 });
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (item.location.length > 0) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(item.location);
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
                        this.forEachUpdateFunction(elmtId, this.previewEvents(), forEachItemGenFunction, (item: CourseEvent) => item.importKey, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ top: 12, bottom: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('系统日历同步');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(this.overwritePreviousImports ? '覆盖删除旧导入：开启' : '覆盖删除旧导入：关闭');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.overwritePreviousImports = !this.overwritePreviousImports;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('创建 / 获取应用专用日历');
                        Button.width('100%');
                        Button.margin({ top: 12 });
                        Button.onClick(() => {
                            this.createAppCalendar();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.calendars.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('选择目标日历');
                                    Text.fontSize(16);
                                    Text.fontWeight(FontWeight.Medium);
                                    Text.margin({ top: 14 });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = (_item, index: number) => {
                                        const item = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create();
                                            Row.width('100%');
                                            Row.padding({ top: 10, bottom: 10 });
                                            Row.border({
                                                width: { bottom: 1 },
                                                color: '#EFEFEF'
                                            });
                                            Row.onClick(() => {
                                                this.selectedCalendarIndex = index;
                                            });
                                        }, Row);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(this.selectedCalendarIndex === index ? '●' : '○');
                                            Text.fontSize(18);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create();
                                            Column.margin({ left: 10 });
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(item.name);
                                            Text.fontSize(15);
                                            Text.fontWeight(FontWeight.Medium);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            If.create();
                                            if (item.subTitle.length > 0) {
                                                this.ifElseBranchUpdateFunction(0, () => {
                                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                        Text.create(item.subTitle);
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
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Blank.create();
                                        }, Blank);
                                        Blank.pop();
                                        Row.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.calendars, forEachItemGenFunction, (item: CalendarOption) => item.id, true, false);
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
            Stack.backgroundColor('#F5F6FA');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 底层视图：依据状态进行渲染
            if (!this.isReady) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 顶层视图：网页登录 Overlay，完美保留你之前的结构
            if (this.showLoginPanel) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#F5F6FA');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('统一认证网页登录');
                        Text.fontSize(20);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('关闭');
                        Button.onClick(() => {
                            this.showLoginPanel = false;
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(16);
                        Column.margin({ left: 16, right: 16 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.loginHintText);
                        Text.fontSize(13);
                        Text.fontColor('#555555');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.webCurrentUrl.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Web.create({ src: 'about:blank', controller: this.loginWebController });
                        Web.width('100%');
                        Web.height('65%');
                        Web.margin({ top: 12, left: 16, right: 16 });
                        Web.backgroundColor(Color.White);
                        Web.onControllerAttached(() => {
                            try {
                                this.loginWebController.setCustomUserAgent(HttpService.browserUserAgent);
                            }
                            catch (error) {
                                console.error(`setCustomUserAgent failed: ${JSON.stringify(error)}`);
                            }
                            this.loginWebController.loadUrl(AuthService.buildWebLoginEntryUrl(this.schoolType));
                        });
                        Web.onPageBegin((event) => {
                            if (event) {
                                this.webCurrentUrl = event.url;
                            }
                        });
                        Web.onPageEnd((event) => {
                            if (event) {
                                this.webCurrentUrl = event.url;
                                if (event.url.includes('index.do')) {
                                    this.loginHintText = '检测到你可能已经进入课表首页。现在可以点击下方按钮保存登录态。';
                                }
                            }
                        });
                        Web.javaScriptAccess(true);
                        Web.domStorageAccess(true);
                    }, Web);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
