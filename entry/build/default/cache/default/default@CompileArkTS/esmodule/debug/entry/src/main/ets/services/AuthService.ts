import webview from "@ohos:web.webview";
import type common from "@ohos:app.ability.common";
import { PreferenceStore } from "@bundle:com.mc121.njucalendarimporter/entry/ets/services/PreferenceStore";
import { SessionInfo } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
import { SchoolTypeHelper } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
import type { SchoolType } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/SchoolType";
export class AuthService {
    static loginUrl: string = 'https://authserver.nju.edu.cn/authserver/login';
    static async clearWebCookies(): Promise<void> {
        webview.WebCookieManager.clearAllCookiesSync();
    }
    static buildWebLoginEntryUrl(type: SchoolType): string {
        return SchoolTypeHelper.appShowUrl(type);
    }
    static buildWebAppIndexUrl(type: SchoolType): string {
        return SchoolTypeHelper.appIndexUrl(type);
    }
    static restoreSession(context: common.UIAbilityContext): SessionInfo | undefined {
        return PreferenceStore.loadSession(context);
    }
    static async clearSession(context: common.UIAbilityContext): Promise<void> {
        await PreferenceStore.clearSession(context);
    }
    static async captureSessionFromWebView(context: common.UIAbilityContext, schoolType: SchoolType, usernameHint: string): Promise<SessionInfo> {
        try {
            await webview.WebCookieManager.saveCookieAsync();
        }
        catch (error) {
            console.error(`saveCookieAsync failed: ${JSON.stringify(error)}`);
        }
        let authCookie = await webview.WebCookieManager.fetchCookie(AuthService.loginUrl, false);
        let ehallCookie = await webview.WebCookieManager.fetchCookie(SchoolTypeHelper.appShowUrl(schoolType), false);
        let ehallAppCookie = await webview.WebCookieManager.fetchCookie(SchoolTypeHelper.appIndexUrl(schoolType), false);
        if (String(authCookie ?? '').trim().length === 0) {
            throw new Error('未读取到统一认证 Cookie，请确认你已经完成统一认证登录。');
        }
        if (String(ehallAppCookie ?? '').trim().length === 0) {
            throw new Error('未读取到 ehallapp Cookie。请在网页中继续等待，直到真正进入课表应用首页。');
        }
        let session = new SessionInfo();
        session.usernameHint = usernameHint.trim().length > 0 ? usernameHint.trim() : '已登录用户';
        session.schoolType = schoolType;
        session.authCookie = String(authCookie ?? '');
        session.ehallCookie = String(ehallCookie ?? '');
        session.ehallAppCookie = String(ehallAppCookie ?? '');
        await PreferenceStore.saveSession(context, session);
        return session;
    }
}
