import type { Permissions } from "@ohos:abilityAccessCtrl";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
export class PermissionService {
    static async requestCalendarPermissions(m23: common.UIAbilityContext): Promise<boolean> {
        let n23: Permissions[] = [
            'ohos.permission.READ_CALENDAR',
            'ohos.permission.WRITE_CALENDAR'
        ];
        let o23 = abilityAccessCtrl.createAtManager();
        let p23 = await o23.requestPermissionsFromUser(m23, n23);
        if (!p23 || !p23.authResults || p23.authResults.length < n23.length) {
            return false;
        }
        for (let q23 = 0; q23 < p23.authResults.length; q23++) {
            if (p23.authResults[q23] !== 0) {
                return false;
            }
        }
        return true;
    }
}
