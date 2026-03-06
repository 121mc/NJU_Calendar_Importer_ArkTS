@Entry
@Component
export struct PrivacyPolicyPage {
  build() {
    Navigation() {
      Scroll() {
        Column() {
          Text('呢喃课表导入隐私政策')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .margin({ bottom: 12 })

          Text('生效日期：2026-03-03')
            .fontSize(14)
            .fontColor($r('sys.color.ohos_id_color_text_secondary'))
            .margin({ bottom: 16 })

          // 1. 应用基本说明
          Text('1. 应用基本说明')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('本应用用于帮助呢喃学生将课表与考试信息导入手机系统日历。本应用不提供社交、广告、支付或个性化推荐功能。\n\n本项目是个人开发项目，与位于江苏省南京市的任何大学均无关。')
            .fontSize(15)
            .lineHeight(22)

          // 2. 我们处理的信息
          Text('2. 我们处理的信息')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('为了实现课表导入功能，本应用可能在你主动操作时处理以下信息：\n• 你在官方统一认证页面输入并完成认证所需的信息。\n• 从官方系统返回的课表、考试、上课地点、教师等信息。\n• 你授权后可访问的系统日历列表与本应用写入的日历事件。')
            .fontSize(15)
            .lineHeight(22)

          // 3. 权限使用说明
          Text('3. 权限使用说明')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('本应用会在获得你授权后申请日历权限，用于：\n• 读取系统日历列表，供你选择导入目标日历；\n• 将课表和考试信息写入系统日历；\n• 删除本应用此前导入的旧事件，避免重复。')
            .fontSize(15)
            .lineHeight(22)

          // 4. 数据传输与存储
          Text('4. 数据传输与存储')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('本应用不会将你的课表、日历内容或账号信息上传到开发者自建服务器。\n本应用仅在你使用登录和课表拉取功能时，与官方系统进行网络通信。\n必要的登录态、设置项或功能状态仅保存在你的设备本地，用于保证功能正常运行。')
            .fontSize(15)
            .lineHeight(22)

          // 5. 第三方服务说明
          Text('5. 第三方服务说明')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('本应用依赖设备系统提供的日历能力，并通过应用内网页访问官方认证与课表系统。')
            .fontSize(15)
            .lineHeight(22)

          // 6. 你的权利
          Text('6. 你的权利')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('你可以拒绝授予日历权限，但届时将无法使用系统日历同步功能。\n你可以在系统设置中关闭日历权限，或在应用内清除本应用导入的日历事件。')
            .fontSize(15)
            .lineHeight(22)

          // 7. 联系方式
          Text('7. 联系方式')
            .fontSize(17)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 16, bottom: 8 })
          Text('维护者：mc_121\n联系邮箱：mc_121_@outlook.com')
            .fontSize(15)
            .lineHeight(22)

          // 底部留白
          Blank().height(40)
        }
        .alignItems(HorizontalAlign.Start)
        .padding(16)
        .width('100%')
      }
      .align(Alignment.TopStart)
    }
    .title('隐私政策')
    .titleMode(NavigationTitleMode.Mini) // 鸿蒙原生的小标题栏样式
    .hideBackButton(false)
  }
}