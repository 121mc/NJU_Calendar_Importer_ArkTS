import preferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
import { SessionInfo } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
export class PreferenceStore {
    private static preferenceName: string = 'nju_calendar_importer';
    private static sessionKey: string = 'session_json';
    private static getPreferences(a24: common.UIAbilityContext): preferences.Preferences {
        return preferences.getPreferencesSync(a24, { name: PreferenceStore.preferenceName });
    }
    static async saveSession(x23: common.UIAbilityContext, y23: SessionInfo): Promise<void> {
        let z23 = PreferenceStore.getPreferences(x23);
        z23.putSync(PreferenceStore.sessionKey, y23.toJsonString());
        await z23.flush();
    }
    static loadSession(t23: common.UIAbilityContext): SessionInfo | undefined {
        let u23 = PreferenceStore.getPreferences(t23);
        let v23 = u23.getSync(PreferenceStore.sessionKey, '') as string;
        if (v23 === undefined || v23.trim().length === 0) {
            return undefined;
        }
        try {
            return SessionInfo.fromJsonString(v23);
        }
        catch (w23) {
            console.error(`Failed to parse saved session: ${JSON.stringify(w23)}`);
            return undefined;
        }
    }
    static async clearSession(r23: common.UIAbilityContext): Promise<void> {
        let s23 = PreferenceStore.getPreferences(r23);
        s23.deleteSync(PreferenceStore.sessionKey);
        await s23.flush();
    }
}
