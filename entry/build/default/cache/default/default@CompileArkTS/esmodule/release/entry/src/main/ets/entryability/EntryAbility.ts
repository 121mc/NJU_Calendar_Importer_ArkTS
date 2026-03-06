import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import type window from "@ohos:window";
import type { BusinessError } from "@ohos:base";
export default class EntryAbility extends UIAbility {
    onCreate(c: Want): void {
        console.info('EntryAbility onCreate');
    }
    onDestroy(): void {
        console.info('EntryAbility onDestroy');
    }
    onWindowStageCreate(a: window.WindowStage): void {
        a.loadContent('pages/Index', (b: BusinessError) => {
            if (b && b.code !== 0) {
                console.error(`Failed to load content. Code: ${b.code}, message: ${b.message}`);
            }
        });
    }
    onWindowStageDestroy(): void {
        console.info('EntryAbility onWindowStageDestroy');
    }
}
