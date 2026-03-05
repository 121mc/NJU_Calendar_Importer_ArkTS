import { promptAction } from '@kit.ArkUI';
import { webview } from '@kit.ArkWeb';
import { common } from '@kit.AbilityKit';
import router from '@ohos.router';
import dataPreferences from '@ohos.data.preferences';

import { CourseEvent, ScheduleBundle, SessionInfo, CalendarOption } from '../models/Models';
import { SchoolType, SchoolTypeHelper } from '../models/SchoolType';
import { AuthService } from '../services/AuthService';
import { HttpService } from '../services/HttpService';
import { NjuScheduleService } from '../services/NjuScheduleService';
import { CalendarSyncService } from '../services/CalendarSyncService';

// 1. 定义隐私政策弹窗组件
@CustomDialog
struct PrivacyDialog {
  controller: CustomDialogController
  cancel: () => void = () => {}
  confirm: () => void = () => {}
  openPrivacyPage: () => void = () => {}

  build() {
    Column() {
      Text('隐私政策与用户说明')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 24, bottom: 12 })

      Scroll() {
        Text('欢迎使用“NJU课表导入”。\n\n在你使用本应用前，请先阅读并同意《隐私政策》。本应用主要提供南京大学课表导入系统日历功能。为实现该功能，本应用会在你主动操作时访问南京大学官方登录页面，并在获得你授权后申请日历权限，以便读取系统日历列表、写入课表事件以及清理本应用此前导入的数据。\n\n本应用不包含广告、不包含内购，也不会将你的账号、课表内容或日历数据上传到开发者自建服务器。相关数据仅在你的设备本地处理，并仅在访问南京大学官方系统时与学校服务器通信。')
          .fontSize(15)
          .fontColor('#666666')
          .lineHeight(22)
      }
      .height(200) // 限制滚动区域高度
      .margin({ left: 24, right: 24, bottom: 20 })

      Row() {
        Button('暂不同意')
          .backgroundColor(Color.Transparent)
          .fontColor('#999999')
          .onClick(() => {
            this.controller.close()
            this.cancel()
          })

        Button('查看政策')
          .backgroundColor(Color.Transparent)
          .fontColor('#007DFF')
          .onClick(() => {
            this.openPrivacyPage()
          })

        Button('同意并继续')
          .backgroundColor('#007DFF')
          .fontColor(Color.White)
          .onClick(() => {
            this.controller.close()
            this.confirm()
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceEvenly)
      .margin({ bottom: 16 })
    }
    .width('90%')
    .backgroundColor(Color.White)
    .borderRadius(16)
  }
}

@Entry
@Component
struct Index {
  private context: common.UIAbilityContext | undefined = undefined;
  private loginWebController: webview.WebviewController = new webview.WebviewController();

  // --- 隐私政策相关的状态 ---
  @State privacyAccepted: boolean = false;
  @State isReady: boolean = false;

  @State schoolType: SchoolType = SchoolType.UNDERGRAD;
  @State usernameHint: string = '';
  @State session: SessionInfo | undefined = undefined;
  @State bundle: ScheduleBundle | undefined = undefined;
  @State calendars: CalendarOption[] = [];
  @State selectedCalendarIndex: number = -1;
  @State includeFinalExams: boolean = true;
  @State overwritePreviousImports: boolean = true;
  @State loadingSchedule: boolean = false;
  @State loadingCalendars: boolean = false;
  @State syncingCalendar: boolean = false;
  @State deletingImported: boolean = false;
  @State showLoginPanel: boolean = false;
  @State savingLoginState: boolean = false;
  @State webCurrentUrl: string = '';
  @State loginHintText: string = '请在下方网页中完成统一认证登录，并确保已经真正进入课表应用首页。';

  // 注册弹窗控制器
  dialogController: CustomDialogController = new CustomDialogController({
    builder: PrivacyDialog({
      cancel: () => {
        this.privacyAccepted = false;
      },
      confirm: async () => {
        this.privacyAccepted = true;
        // 存入底层缓存，下次不再弹窗
        if (this.context) {
          try {
            let prefs = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
            await prefs.put('privacyAccepted', true);
            await prefs.flush();
          } catch (e) {
            console.error('Save privacy state failed', e);
          }
        }
        this.initSession(); // 同意后初始化登录态
      },
      openPrivacyPage: () => {
        router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
      }
    }),
    autoCancel: false,
    alignment: DialogAlignment.Center
  })

  aboutToAppear(): void {
    this.context = this.getUIContext().getHostContext() as common.UIAbilityContext;
    try {
      webview.WebviewController.setWebDebuggingAccess(true);
    } catch (error) {
      console.error(`setWebDebuggingAccess failed: ${JSON.stringify(error)}`);
    }

    // 首先检查隐私协议状态
    this.checkPrivacyStatus();
  }

  private async checkPrivacyStatus() {
    if (this.context === undefined) return;
    try {
      let prefs = await dataPreferences.getPreferences(this.context, 'NjuSchedulePrefs');
      this.privacyAccepted = (await prefs.get('privacyAccepted', false)) as boolean;
    } catch (e) {
      this.privacyAccepted = false;
    }

    this.isReady = true;

    if (!this.privacyAccepted) {
      this.dialogController.open();
    } else {
      this.initSession();
    }
  }

  private initSession() {
    if (this.context !== undefined) {
      let restored = AuthService.restoreSession(this.context);
      if (restored !== undefined) {
        this.session = restored;
        this.schoolType = restored.schoolType;
        if (restored.usernameHint !== '已登录用户') {
          this.usernameHint = restored.usernameHint;
        }
      }
    }
  }

  private toast(message: string): void {
    promptAction.showToast({ message: message, duration: 2000 });
  }

  private formatDateTime(timestamp: number): string {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let day = `${date.getDate()}`.padStart(2, '0');
    let hour = `${date.getHours()}`.padStart(2, '0');
    let minute = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  private previewEvents(): CourseEvent[] {
    if (this.bundle === undefined) {
      return [];
    }
    let result: CourseEvent[] = [];
    let count = Math.min(this.bundle.events.length, 12);
    for (let i = 0; i < count; i++) {
      result.push(this.bundle.events[i]);
    }
    return result;
  }

  private currentCalendar(): CalendarOption | undefined {
    if (this.selectedCalendarIndex < 0 || this.selectedCalendarIndex >= this.calendars.length) {
      return undefined;
    }
    return this.calendars[this.selectedCalendarIndex];
  }

  private async openLoginPanel(): Promise<void> {
    this.showLoginPanel = true;
    this.webCurrentUrl = '';
    this.loginHintText = '请在下方网页中完成统一认证登录，并确保已经真正进入课表应用首页。';
  }

  private async saveLoginState(): Promise<void> {
    if (this.context === undefined) {
      this.toast('上下文未初始化。');
      return;
    }
    this.savingLoginState = true;
    try {
      let session = await AuthService.captureSessionFromWebView(this.context, this.schoolType, this.usernameHint);
      this.session = session;
      this.bundle = undefined;
      this.calendars = [];
      this.selectedCalendarIndex = -1;
      this.showLoginPanel = false;
      this.toast('登录成功，已保存登录态。');
    } catch (error) {
      this.toast(`保存登录态失败：${String(error)}`);
    } finally {
      this.savingLoginState = false;
    }
  }

  private async clearSessionAndCookies(): Promise<void> {
    if (this.context === undefined) {
      return;
    }
    await AuthService.clearSession(this.context);
    await AuthService.clearWebCookies();
    this.session = undefined;
    this.bundle = undefined;
    this.calendars = [];
    this.selectedCalendarIndex = -1;
    this.toast('已清空登录态和 Web Cookie。');
  }

  private async loadSchedule(): Promise<void> {
    if (this.session === undefined) {
      this.toast('请先完成网页登录。');
      return;
    }
    this.loadingSchedule = true;
    try {
      let includeExams = SchoolTypeHelper.supportsFinalExams(this.session.schoolType) ? this.includeFinalExams : false;
      let bundle = await NjuScheduleService.fetchCurrentSemesterSchedule(this.session, includeExams);
      this.bundle = bundle;
      this.toast(`已拉取 ${bundle.events.length} 条日历事件。`);
    } catch (error) {
      this.toast(`拉取课表失败：${String(error)}`);
    } finally {
      this.loadingSchedule = false;
    }
  }

  private async loadCalendars(): Promise<void> {
    if (this.context === undefined) {
      return;
    }
    this.loadingCalendars = true;
    try {
      let calendars = await CalendarSyncService.listWritableCalendars(this.context);
      this.calendars = calendars;
      this.selectedCalendarIndex = calendars.length > 0 ? 0 : -1;
      if (calendars.length === 0) {
        this.toast('当前没有可用的系统日历，你可以创建一个应用专用日历。');
      } else {
        this.toast(`已加载 ${calendars.length} 个日历。`);
      }
    } catch (error) {
      this.toast(`加载系统日历失败：${String(error)}`);
    } finally {
      this.loadingCalendars = false;
    }
  }

  private async createAppCalendar(): Promise<void> {
    if (this.context === undefined) {
      return;
    }
    try {
      let calendar = await CalendarSyncService.createOrGetAppCalendar(this.context);
      await this.loadCalendars();
      for (let i = 0; i < this.calendars.length; i++) {
        if (this.calendars[i].name === calendar.name) {
          this.selectedCalendarIndex = i;
          break;
        }
      }
      this.toast('已准备好应用专用日历。');
    } catch (error) {
      this.toast(`创建应用专用日历失败：${String(error)}`);
    }
  }

  private async syncToCalendar(): Promise<void> {
    let calendarOption = this.currentCalendar();
    if (this.bundle === undefined) {
      this.toast('请先拉取课表。');
      return;
    }
    if (calendarOption === undefined || calendarOption.calendar === undefined) {
      this.toast('请先选择一个目标日历。');
      return;
    }
    this.syncingCalendar = true;
    try {
      let result = await CalendarSyncService.syncEvents(calendarOption.calendar, this.bundle, this.overwritePreviousImports);
      let warning = result.warning.length > 0 ? ` ${result.warning}` : '';
      this.toast(`同步完成：新增 ${result.created}，删除 ${result.deleted}，跳过 ${result.skipped}。${warning}`);
    } catch (error) {
      this.toast(`写入系统日历失败：${String(error)}`);
    } finally {
      this.syncingCalendar = false;
    }
  }

  private async deleteImportedEvents(): Promise<void> {
    let calendarOption = this.currentCalendar();
    if (calendarOption === undefined || calendarOption.calendar === undefined) {
      this.toast('请先选择一个目标日历。');
      return;
    }
    this.deletingImported = true;
    try {
      let deleted = await CalendarSyncService.deleteImportedEvents(calendarOption.calendar);
      this.toast(`已删除 ${deleted} 条由本应用导入的事件。`);
    } catch (error) {
      this.toast(`清空失败：${String(error)}`);
    } finally {
      this.deletingImported = false;
    }
  }

  // === UI 构建区块 ===

  @Builder
  PrivacyBlockedView() {
    Column() {
      // 占位图标
      Image($r('app.media.app_icon'))
        .width(80)
        .height(80)
        .margin({ bottom: 20 })
        .opacity(0.5)

      Text('请先阅读并同意隐私政策')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 12 })

      Text('在你同意隐私政策前，本应用不会继续读取本地登录态，也不会申请日历权限或提供课表导入功能。')
        .fontSize(14)
        .fontColor('#666666')
        .textAlign(TextAlign.Center)
        .padding({ left: 32, right: 32 })
        .lineHeight(20)
        .margin({ bottom: 32 })

      Button('查看并同意隐私政策')
        .width('80%')
        .onClick(() => {
          this.dialogController.open();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  MainContent() {
    Column() {
      // 自定义顶部 Header 栏，并在右上角加入隐私政策快捷入口
      Row() {
        Text('南大课表导入日历')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
        Blank()

        // 🚀 右上角的隐私政策入口
        Text('隐私政策')
          .fontSize(14)
          .fontColor('#007DFF')
          .margin({ right: 12 })
          .onClick(() => {
            router.pushUrl({ url: 'pages/PrivacyPolicyPage' });
          })

        Text('ArkTS')
          .fontSize(12)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Scroll() {
        Column() {
          Column() {
            Text('说明')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
            Text('1. 使用南京大学官方统一认证网页登录，不手动处理验证码。')
              .margin({ top: 8 })
            Text('2. 拉取当前学期课表；本科生可选是否包含期末考试。')
              .margin({ top: 6 })
            Text('3. 选择系统日历后写入，并支持覆盖删除本应用此前导入的旧事件。')
              .margin({ top: 6 })
            Text('4. 如果系统里没有合适的日历，可以创建一个应用专用本地日历。')
              .margin({ top: 6 })
          }
          .width('100%')
          .padding(16)
          .backgroundColor(Color.White)
          .borderRadius(16)

          Column() {
            Text('登录')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
            Text(`当前身份：${SchoolTypeHelper.shortLabel(this.schoolType)}`)
              .margin({ top: 8 })
            Row() {
              Button(this.schoolType === SchoolType.UNDERGRAD ? '本科生（当前）' : '切换为本科生')
                .onClick(() => {
                  this.schoolType = SchoolType.UNDERGRAD;
                })
              Blank().width(12)
              Button(this.schoolType === SchoolType.GRADUATE ? '研究生（当前）' : '切换为研究生')
                .onClick(() => {
                  this.schoolType = SchoolType.GRADUATE;
                })
            }
            .width('100%')
            .margin({ top: 10 })

            TextInput({ text: this.usernameHint, placeholder: '备注用户名（可选，仅本地显示）' })
              .onChange((value: string) => {
                this.usernameHint = value;
              })
              .margin({ top: 12 })

            if (this.session === undefined) {
              Button('打开统一认证网页登录')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  this.openLoginPanel();
                })
            } else {
              Text(`当前登录态：${SchoolTypeHelper.label(this.session.schoolType)} / ${this.session.usernameHint}`)
                .margin({ top: 12 })
              Button('清除登录态并重登')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  this.clearSessionAndCookies();
                })
            }
          }
          .width('100%')
          .padding(16)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ top: 12 })

          if (this.session !== undefined) {
            Column() {
              Text('拉取课表')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
              if (SchoolTypeHelper.supportsFinalExams(this.session.schoolType)) {
                Button(this.includeFinalExams ? '期末考试：已包含' : '期末考试：未包含')
                  .width('100%')
                  .margin({ top: 12 })
                  .onClick(() => {
                    this.includeFinalExams = !this.includeFinalExams;
                  })
              }
              Button(this.loadingSchedule ? '正在拉取课表…' : '拉取当前学期课表')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  if (!this.loadingSchedule) {
                    this.loadSchedule();
                  }
                })
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ top: 12 })
          }

          if (this.bundle !== undefined) {
            Column() {
              Text('课表预览')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
              Text(`学期：${this.bundle.semesterName}`)
                .margin({ top: 8 })
              Text(`课程数：${this.bundle.courseCount}    考试数：${this.bundle.examCount}    事件总数：${this.bundle.events.length}`)
                .margin({ top: 6 })

              ForEach(this.previewEvents(), (item: CourseEvent) => {
                Column() {
                  Text(item.title)
                    .fontSize(15)
                    .fontWeight(FontWeight.Medium)
                  Text(`${this.formatDateTime(item.startTime)} - ${this.formatDateTime(item.endTime)}`)
                    .fontSize(12)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                  if (item.location.length > 0) {
                    Text(item.location)
                      .fontSize(12)
                      .fontColor('#666666')
                      .margin({ top: 2 })
                  }
                }
                .width('100%')
                .padding({ top: 10, bottom: 10 })
                .border({
                  width: { bottom: 1 },
                  color: '#EFEFEF'
                })
              }, (item: CourseEvent) => item.importKey)
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ top: 12 })

            Column() {
              Text('系统日历同步')
                .fontSize(18)
                .fontWeight(FontWeight.Bold)
              Button(this.overwritePreviousImports ? '覆盖删除旧导入：开启' : '覆盖删除旧导入：关闭')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  this.overwritePreviousImports = !this.overwritePreviousImports;
                })
              Button(this.loadingCalendars ? '正在加载日历…' : '加载系统日历')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  if (!this.loadingCalendars) {
                    this.loadCalendars();
                  }
                })
              Button('创建 / 获取应用专用日历')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  this.createAppCalendar();
                })

              if (this.calendars.length > 0) {
                Text('选择目标日历')
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .margin({ top: 14 })
                ForEach(this.calendars, (item: CalendarOption, index: number) => {
                  Row() {
                    Text(this.selectedCalendarIndex === index ? '●' : '○')
                      .fontSize(18)
                    Column() {
                      Text(item.name)
                        .fontSize(15)
                        .fontWeight(FontWeight.Medium)
                      if (item.subTitle.length > 0) {
                        Text(item.subTitle)
                          .fontSize(12)
                          .fontColor('#666666')
                          .margin({ top: 2 })
                      }
                    }
                    .margin({ left: 10 })
                    Blank()
                  }
                  .width('100%')
                  .padding({ top: 10, bottom: 10 })
                  .border({
                    width: { bottom: 1 },
                    color: '#EFEFEF'
                  })
                  .onClick(() => {
                    this.selectedCalendarIndex = index;
                  })
                }, (item: CalendarOption) => item.id)
              }

              Button(this.syncingCalendar ? '正在写入系统日历…' : '写入系统日历')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  if (!this.syncingCalendar) {
                    this.syncToCalendar();
                  }
                })
              Button(this.deletingImported ? '正在清空导入事件…' : '一键清空本应用导入事件')
                .width('100%')
                .margin({ top: 12 })
                .onClick(() => {
                  if (!this.deletingImported) {
                    this.deleteImportedEvents();
                  }
                })
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.White)
            .borderRadius(16)
            .margin({ top: 12, bottom: 16 })
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16 })
      }
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  build() {
    Stack() {
      // 底层视图：依据状态进行渲染
      if (!this.isReady) {
        Column() {
          LoadingProgress().width(64).height(64)
        }.width('100%').height('100%').justifyContent(FlexAlign.Center)
      } else if (!this.privacyAccepted) {
        this.PrivacyBlockedView()
      } else {
        this.MainContent()
      }

      // 顶层视图：网页登录 Overlay，完美保留你之前的结构
      if (this.showLoginPanel) {
        Column() {
          Row() {
            Text('统一认证网页登录')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
            Blank()
            Button('关闭')
              .onClick(() => {
                this.showLoginPanel = false;
              })
          }
          .width('100%')
          .padding({ left: 16, right: 16, top: 16, bottom: 8 })

          Column() {
            Text(this.loginHintText)
              .fontSize(13)
              .fontColor('#555555')
            if (this.webCurrentUrl.length > 0) {
              Text(`当前网址：${this.webCurrentUrl}`)
                .fontSize(11)
                .fontColor('#777777')
                .margin({ top: 8 })
            }
          }
          .width('100%')
          .padding(16)
          .backgroundColor(Color.White)
          .borderRadius(16)
          .margin({ left: 16, right: 16 })

          Web({ src: 'about:blank', controller: this.loginWebController })
            .width('100%')
            .height('65%')
            .margin({ top: 12, left: 16, right: 16 })
            .backgroundColor(Color.White)
            .onControllerAttached(() => {
              try {
                this.loginWebController.setCustomUserAgent(HttpService.browserUserAgent);
              } catch (error) {
                console.error(`setCustomUserAgent failed: ${JSON.stringify(error)}`);
              }
              this.loginWebController.loadUrl(AuthService.buildWebLoginEntryUrl(this.schoolType));
            })
            .onPageBegin((event) => {
              if (event) {
                this.webCurrentUrl = event.url;
              }
            })
            .onPageEnd((event) => {
              if (event) {
                this.webCurrentUrl = event.url;
                if (event.url.includes('index.do')) {
                  this.loginHintText = '检测到你可能已经进入课表首页。现在可以点击下方按钮保存登录态。';
                }
              }
            })
            .javaScriptAccess(true)
            .domStorageAccess(true)

          Button(this.savingLoginState ? '正在保存登录态…' : '我已进入课表应用首页，保存登录态')
            .width('100%')
            .margin({ top: 12, left: 16, right: 16 })
            .onClick(() => {
              if (!this.savingLoginState) {
                this.saveLoginState();
              }
            })
          Button('清空网页 Cookie 后重新登录')
            .width('100%')
            .margin({ top: 12, left: 16, right: 16 })
            .onClick(() => {
              AuthService.clearWebCookies();
              this.loginWebController.loadUrl(AuthService.buildWebLoginEntryUrl(this.schoolType));
              this.loginHintText = '已清空 Cookie，请重新完成网页登录。';
            })
        }
        .width('100%')
        .height('100%')
        .backgroundColor('#F5F6FA')
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F6FA')
  }
}