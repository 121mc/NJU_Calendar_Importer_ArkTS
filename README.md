# NJU Calendar Importer for HarmonyOS (ArkTS)

这是一个基于 ArkTS / HarmonyOS 的南京大学课表导入日历项目，按照原 Flutter 项目的主流程重写：

1. 统一认证网页登录
2. 拉取当前学期课表
3. 预览课程 / 考试事件
4. 选择系统日历或创建应用专用日历
5. 写入、覆盖删除、清空本应用导入事件

## 工程说明

- 该工程按照最新 DevEco Studio / HarmonyOS Stage 工程结构整理。
- 没有引入第三方依赖，全部基于系统 Kit：
  - `@kit.ArkWeb`
  - `@kit.NetworkKit`
  - `@kit.CalendarKit`
  - `@kit.ArkData`
  - `@kit.AbilityKit`
- 首次打开工程后，若 IDE 提示签名未配置，请直接在 DevEco Studio 中配置 debug 签名即可。

## 你需要做的事

1. 用 **最新版本 DevEco Studio** 打开本工程。
2. 如果 IDE 让你补签名，按默认 debug signing 配置一次。
3. 连上 HarmonyOS 手机或启动模拟器。
4. 运行后，先在应用内完成网页登录，再拉取课表并写入系统日历。

## 说明

因为 HarmonyOS SDK 会随 DevEco Studio 更新，`WebCookieManager`、`Calendar Kit` 的个别方法名如果在你本机 SDK 上再次发生微调，请以 IDE 自动补全为准做极少量对齐。当前这份代码已经按 2026 年 3 月可查到的最新官方 API 习惯重写。
