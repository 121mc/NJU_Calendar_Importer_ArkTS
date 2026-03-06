import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import type window from "@ohos:window";
import type { BusinessError } from "@ohos:base";
export default class EntryAbility extends UIAbility {
    onCreate(want: Want): void {
        console.info('EntryAbility onCreate');
    }
    onDestroy(): void {
        console.info('EntryAbility onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        windowStage.loadContent('pages/Index', (err: BusinessError) => {
            if (err && err.code !== 0) {
                console.error(`Failed to load content. Code: ${err.code}, message: ${err.message}`);
            }
        });
    }
    onWindowStageDestroy(): void {
        console.info('EntryAbility onWindowStageDestroy');
    }
}
