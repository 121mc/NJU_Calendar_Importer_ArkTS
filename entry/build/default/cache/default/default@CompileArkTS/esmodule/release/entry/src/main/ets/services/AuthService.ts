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
    static buildWebLoginEntryUrl(f13: SchoolType): string {
        return SchoolTypeHelper.appShowUrl(f13);
    }
    static buildWebAppIndexUrl(e13: SchoolType): string {
        return SchoolTypeHelper.appIndexUrl(e13);
    }
    static restoreSession(d13: common.UIAbilityContext): SessionInfo | undefined {
        return PreferenceStore.loadSession(d13);
    }
    static async clearSession(c13: common.UIAbilityContext): Promise<void> {
        await PreferenceStore.clearSession(c13);
    }
    static async captureSessionFromWebView(u12: common.UIAbilityContext, v12: SchoolType, w12: string): Promise<SessionInfo> {
        try {
            await webview.WebCookieManager.saveCookieAsync();
        }
        catch (b13) {
            console.error(`saveCookieAsync failed: ${JSON.stringify(b13)}`);
        }
        let x12 = await webview.WebCookieManager.fetchCookie(AuthService.loginUrl, false);
        let y12 = await webview.WebCookieManager.fetchCookie(SchoolTypeHelper.appShowUrl(v12), false);
        let z12 = await webview.WebCookieManager.fetchCookie(SchoolTypeHelper.appIndexUrl(v12), false);
        if (String(x12 ?? '').trim().length === 0) {
            throw new Error('未读取到统一认证 Cookie，请确认你已经完成统一认证登录。');
        }
        if (String(z12 ?? '').trim().length === 0) {
            throw new Error('未读取到 ehallapp Cookie。请在网页中继续等待，直到真正进入课表应用首页。');
        }
        let a13 = new SessionInfo();
        a13.usernameHint = w12.trim().length > 0 ? w12.trim() : '已登录用户';
        a13.schoolType = v12;
        a13.authCookie = String(x12 ?? '');
        a13.ehallCookie = String(y12 ?? '');
        a13.ehallAppCookie = String(z12 ?? '');
        await PreferenceStore.saveSession(u12, a13);
        return a13;
    }
}
