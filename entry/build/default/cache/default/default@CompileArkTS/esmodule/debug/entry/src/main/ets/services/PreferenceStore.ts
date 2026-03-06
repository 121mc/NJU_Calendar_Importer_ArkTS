import preferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
import { SessionInfo } from "@bundle:com.mc121.njucalendarimporter/entry/ets/models/Models";
export class PreferenceStore {
    private static preferenceName: string = 'nju_calendar_importer';
    private static sessionKey: string = 'session_json';
    private static getPreferences(context: common.UIAbilityContext): preferences.Preferences {
        return preferences.getPreferencesSync(context, { name: PreferenceStore.preferenceName });
    }
    static async saveSession(context: common.UIAbilityContext, session: SessionInfo): Promise<void> {
        let pref = PreferenceStore.getPreferences(context);
        pref.putSync(PreferenceStore.sessionKey, session.toJsonString());
        await pref.flush();
    }
    static loadSession(context: common.UIAbilityContext): SessionInfo | undefined {
        let pref = PreferenceStore.getPreferences(context);
        let raw = pref.getSync(PreferenceStore.sessionKey, '') as string;
        if (raw === undefined || raw.trim().length === 0) {
            return undefined;
        }
        try {
            return SessionInfo.fromJsonString(raw);
        }
        catch (error) {
            console.error(`Failed to parse saved session: ${JSON.stringify(error)}`);
            return undefined;
        }
    }
    static async clearSession(context: common.UIAbilityContext): Promise<void> {
        let pref = PreferenceStore.getPreferences(context);
        pref.deleteSync(PreferenceStore.sessionKey);
        await pref.flush();
    }
}
