import type { Permissions } from "@ohos:abilityAccessCtrl";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
export class PermissionService {
    static async requestCalendarPermissions(context: common.UIAbilityContext): Promise<boolean> {
        let permissions: Permissions[] = [
            'ohos.permission.READ_CALENDAR',
            'ohos.permission.WRITE_CALENDAR'
        ];
        let atManager = abilityAccessCtrl.createAtManager();
        let result = await atManager.requestPermissionsFromUser(context, permissions);
        if (!result || !result.authResults || result.authResults.length < permissions.length) {
            return false;
        }
        for (let i = 0; i < result.authResults.length; i++) {
            if (result.authResults[i] !== 0) {
                return false;
            }
        }
        return true;
    }
}
