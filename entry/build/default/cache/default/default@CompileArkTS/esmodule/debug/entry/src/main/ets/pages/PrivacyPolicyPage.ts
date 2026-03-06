if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PrivacyPolicyPage_Params {
}
export class PrivacyPolicyPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PrivacyPolicyPage_Params) {
    }
    updateStateVars(params: PrivacyPolicyPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(new NavPathStack(), { moduleName: "entry", pagePath: "entry/src/main/ets/pages/PrivacyPolicyPage", isUserCreateStack: false });
            Navigation.title('隐私政策');
            Navigation.titleMode(NavigationTitleMode.Mini);
            Navigation.hideBackButton(false);
        }, Navigation);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.align(Alignment.TopStart);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.padding(16);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('呢喃课表导入隐私政策');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('生效日期：2026-03-03');
            Text.fontSize(14);
            Text.fontColor({ "id": 125829216, "type": 10001, params: [], "bundleName": "com.mc121.njucalendarimporter", "moduleName": "entry" });
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 1. 应用基本说明
            Text.create('1. 应用基本说明');
            // 1. 应用基本说明
            Text.fontSize(17);
            // 1. 应用基本说明
            Text.fontWeight(FontWeight.Bold);
            // 1. 应用基本说明
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 1. 应用基本说明
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本应用用于帮助呢喃学生将课表与考试信息导入手机系统日历。本应用不提供社交、广告、支付或个性化推荐功能。\n\n本项目是个人开发项目，与位于江苏省南京市的任何大学均无关。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 2. 我们处理的信息
            Text.create('2. 我们处理的信息');
            // 2. 我们处理的信息
            Text.fontSize(17);
            // 2. 我们处理的信息
            Text.fontWeight(FontWeight.Bold);
            // 2. 我们处理的信息
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 2. 我们处理的信息
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('为了实现课表导入功能，本应用可能在你主动操作时处理以下信息：\n• 你在官方统一认证页面输入并完成认证所需的信息。\n• 从官方系统返回的课表、考试、上课地点、教师等信息。\n• 你授权后可访问的系统日历列表与本应用写入的日历事件。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 3. 权限使用说明
            Text.create('3. 权限使用说明');
            // 3. 权限使用说明
            Text.fontSize(17);
            // 3. 权限使用说明
            Text.fontWeight(FontWeight.Bold);
            // 3. 权限使用说明
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 3. 权限使用说明
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本应用会在获得你授权后申请日历权限，用于：\n• 读取系统日历列表，供你选择导入目标日历；\n• 将课表和考试信息写入系统日历；\n• 删除本应用此前导入的旧事件，避免重复。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 4. 数据传输与存储
            Text.create('4. 数据传输与存储');
            // 4. 数据传输与存储
            Text.fontSize(17);
            // 4. 数据传输与存储
            Text.fontWeight(FontWeight.Bold);
            // 4. 数据传输与存储
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 4. 数据传输与存储
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本应用不会将你的课表、日历内容或账号信息上传到开发者自建服务器。\n本应用仅在你使用登录和课表拉取功能时，与官方系统进行网络通信。\n必要的登录态、设置项或功能状态仅保存在你的设备本地，用于保证功能正常运行。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 5. 第三方服务说明
            Text.create('5. 第三方服务说明');
            // 5. 第三方服务说明
            Text.fontSize(17);
            // 5. 第三方服务说明
            Text.fontWeight(FontWeight.Bold);
            // 5. 第三方服务说明
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 5. 第三方服务说明
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本应用依赖设备系统提供的日历能力，并通过应用内网页访问官方认证与课表系统。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 6. 你的权利
            Text.create('6. 你的权利');
            // 6. 你的权利
            Text.fontSize(17);
            // 6. 你的权利
            Text.fontWeight(FontWeight.Bold);
            // 6. 你的权利
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 6. 你的权利
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('你可以拒绝授予日历权限，但届时将无法使用系统日历同步功能。\n你可以在系统设置中关闭日历权限，或在应用内清除本应用导入的日历事件。');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 7. 联系方式
            Text.create('7. 联系方式');
            // 7. 联系方式
            Text.fontSize(17);
            // 7. 联系方式
            Text.fontWeight(FontWeight.Bold);
            // 7. 联系方式
            Text.margin({ top: 16, bottom: 8 });
        }, Text);
        // 7. 联系方式
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('维护者：mc_121\n联系邮箱：mc_121_@outlook.com');
            Text.fontSize(15);
            Text.lineHeight(22);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部留白
            Blank.create();
            // 底部留白
            Blank.height(40);
        }, Blank);
        // 底部留白
        Blank.pop();
        Column.pop();
        Scroll.pop();
        Navigation.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "PrivacyPolicyPage";
    }
}
registerNamedRoute(() => new PrivacyPolicyPage(undefined, {}), "", { bundleName: "com.mc121.njucalendarimporter", moduleName: "entry", pagePath: "pages/PrivacyPolicyPage", pageFullPath: "entry/src/main/ets/pages/PrivacyPolicyPage", integratedHsp: "false", moduleType: "followWithHap" });
