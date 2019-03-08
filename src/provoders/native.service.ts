import { Injectable } from "@angular/core";
import { Screenshot } from "@ionic-native/screenshot";
import { ToastController, ActionSheetController, Platform, AlertButton, AlertOptions, AlertController, Alert } from "ionic-angular";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { AppVersion } from '@ionic-native/app-version';
import { VersionService } from "./version.service";
import { VersionInfo, AlertParam } from "./type";
import { Network } from '@ionic-native/network';
import { APP_ID_FOR_IOS, APP_DOWNLOAD_URL } from "./consts";
import { File } from '@ionic-native/file';
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';

@Injectable()
export class NativeService {

    private url: string;
    private isExist: boolean = false;
    private alertObj: Alert;

    constructor(
        private screenshot: Screenshot,
        private toast: ToastController,
        private action: ActionSheetController,
        private appVersion: AppVersion,
        private vservice: VersionService,
        private platform: Platform,
        private network: Network,
        private alertCtrl: AlertController,
        private inAppBrowser: InAppBrowser,
        private transfer: FileTransfer,
        private fileOpener: FileOpener,
        private file: File,


    ) { }

    onShare() {
        Observable.fromPromise(this.screenshot.URI(100))
            .pipe(
                map((v: any) => {
                    this.url = v.uri || v.URI;
                }),
                mergeMap(() => {
                    return Observable.fromPromise(this.screenshot.save('jpg', 100));
                }))
            .subscribe(() => {
                this.showActionSheet();
            }, () => {
                this.showToast('截图保存失败').present();;
            });
    }

    private showActionSheet() {
        let actionSheet = this.action.create({
            cssClass: 'share-action',
            buttons: [
                {
                    text: '分享到好友',
                    cssClass: 'iconfont icon-wechat',
                    handler: () => this.shareToWechat()
                },
                // {
                //     text: '分享到朋友圈',
                //     cssClass: 'iconfont icon-wechat_timeline',
                //     handler: () => this.shareToTimeLine()
                // }
            ],
        });
        actionSheet.present();
    }

    private shareToWechat() {
        let wechat = (<any>window).Wechat;
        wechat.isInstalled((installed: any) => {
            if (!installed) {
                this.showToast('您没有安装微信！').present();
                return;
            }
        }, (reason: any) => {
            this.showToast('分享失败: ' + reason).present();
        });
        wechat.share({
            message: {
                title: '承兑汇票计算器',
                description: '一款专业，高效，便捷的票据交易工具，在票据交易过程中可轻松的计算出票据交易信息，为广大中小企业在承兑贴现过程中提供便捷的计算服务！',
                thumb: this.url,
                media: {
                    type: wechat.Type.IMAGE,
                    image: this.url
                }
            },
            scene: wechat.Scene.SESSION
        }, () => {
            // this.showToast('分享成功').present();
        }, (reason: any) => {
            this.showToast('分享失败：' + reason).present();
        });
    }

    showToast(msg = '') {
        return this.toast.create({
            message: msg,
            duration: 500,
            cssClass: 'cus-toast',
            position: 'middle',
        });
    }

    // private shareToTimeLine() {
    //     let wechat = (<any>window).Wechat;
    //     wechat.isInstalled((installed: any) => {
    //         if (!installed) {
    //             this.showToast('您没有安装微信！').present();
    //             return;
    //         }
    //     }, (reason: any) => {
    //         this.showToast('分享失败: ' + reason).present();
    //     });
    //     wechat.share({
    //         message: {
    //             title: '承兑汇票计算器',
    //             description: '一款专业，高效，便捷的票据交易工具，在票据交易过程中可轻松的计算出票据交易信息，为广大中小企业在承兑贴现过程中提供便捷的计算服务！',
    //             thumb: this.url,
    //             media: {
    //                 type: wechat.Type.IMAGE,
    //                 image: this.url
    //             }
    //         },
    //         scene: wechat.Scene.TIMELINE
    //     }, () => {
    //         this.showToast('分享成功').present();
    //     }, (reason: any) => {
    //         this.showToast('分享失败: ' + reason).present();
    //     });
    // }

    /**
   * 检查app是否需要更新
   */
    checkUpdate(): Observable<boolean> {
        return Observable.fromPromise(this.appVersion.getVersionNumber())
            .mergeMap((v: string) => {
                return this.vservice.getVision().map((res: VersionInfo) => {
                    return this.compareiVersion(v, res.version);
                });
            });
    }

    /**
   * 转换版本号
   * @param val string
   */
    private changeVersion(val: string): string {
        const arr = val.toString().split('.');
        const num_place = ["", "0", "00", "000", "0000"].reverse();
        arr.map((v, i) => {
            let len = arr[i].length;
            v = num_place[len] + v;
        });
        return arr.join('');
    }

    /**
    * 是否是安卓设备
    */
    isAndroid(): boolean {
        return this.platform.is('android');
    }

    /**
    * 是否是iPhone设备
    */
    isIos(): boolean {
        return this.platform.is('ios');
    }

    /**
     * 比较app版本
     * @param now 
     * @param newv 
     */
    compareiVersion(now: string, newv: string): boolean {
        if (now === newv) return false;
        return this.changeVersion(now) < this.changeVersion(newv);
    }

    /**
   * 升级提示
   */
    noticeUpdate() {
        this.vservice.getVision().subscribe(res => {
            let text = '升级提示';
            if (this.getNetworkType() !== 'wifi') text += '(建议WiFi下升级)';
            const confirmText = this.isAndroid() ? '立即升级' : '商店下载';
            const appleStoreUrl = `itms-apps://itunes.apple.com/cn/app/abc/id${APP_ID_FOR_IOS}?mt=8`;
            const cancelButton: AlertButton = {
                text: '稍后升级',
                role: 'cancel',
                handler: () => { this.isExist = false }
            };
            const confirmButton: AlertButton = {
                text: confirmText,
                handler: () => {
                    this.isIos() ? this.inAppBrowser.create(appleStoreUrl) :
                        this.downloadApp().subscribe(() => {
                        }, () => {
                            this.alert({ message: '升级失败' });
                        });
                }
            }
            let msg: string = res.description.length ? '' : '暂无内容更新简介';
            if (res.description.length) {
                res.description.map((v, i) => {
                    msg += `<p>${i + 1}). ${v}。</p>`;
                });
            }
            const opts: AlertOptions = {
                title: text,
                subTitle: `新版本：${res.version}`,
                message: msg,
                cssClass: 'update-alert',
                buttons: [cancelButton, confirmButton]
            };
            this.alert({ opts, showCancelButton: true, autoDismiss: false });
        }, err => {
            console.log(err);
        });
    }

    /**
     * 获取网络类型 如 `wifi`, `2g`, `3g`, `4g`, `none`
     */
    getNetworkType(): string {
        if (!this.isMobile()) return 'wifi';
        return this.network.type;
    }

    /**
    * 是否真机环境
    */
    isMobile(): boolean {
        return this.platform.is('mobile') && !this.platform.is('mobileweb');
    }

     /**
   * 确定按钮的弹出框，如果已经打开则不再打开
   * @param param AlertParam | string
   * @param showCancel 
   * @param confirmCb 
   * @param cancelCb 
   * @param autoDismiss 
   */
  alert(param: AlertParam) {
    if (this.isExist) return;
    const _param: AlertParam = {
      showCancelButton: false,
      confirmCallback: null,
      cancelCallback: null,
      autoDismiss: true,
      ...param
    };
    this.isExist = true;
    let disappear = 3;
    let timer: number;
    const confirmButton: AlertButton = {
      text: `确定(${disappear}s)`,
      handler: () => {
        this.isExist = false;
        if (timer !== void 0) clearInterval(timer);
        _param.confirmCallback && _param.confirmCallback();
      }
    };
    const btns: AlertButton[] = [{
      text: '取消',
      role: 'cancel',
      handler: () => {
        this.isExist = false;
        _param.cancelCallback && _param.cancelCallback();
      }
    }];
    if (_param.showCancelButton) btns.push(confirmButton);
    const deOpts: AlertOptions = {
      title: _param.message || '',
      subTitle: '',
      message: '',
      cssClass: 'alert-zIndex-highest',
      buttons: _param.showCancelButton ? btns : [confirmButton],
      enableBackdropDismiss: false,
    };
    const _opt: AlertOptions = Object.assign({}, deOpts, _param.opts);
    this.alertObj = this.alertCtrl.create(_opt);
    this.alertObj.present();
    if (!_param.showCancelButton && _param.autoDismiss) {
      timer = setInterval(() => {
        disappear--;
        (<AlertButton>_opt.buttons[0]).text = `确定(${disappear}s)`;
        if (disappear == 0) {
          clearInterval(timer);
          if (this.alertObj) {
            this.alertObj.dismiss();
            this.alertObj = null;
            this.isExist = false;
          }
        }
      }, 1000);
    } else if (!_param.autoDismiss) {
      if (_param.showCancelButton && !param.opts.buttons) (<AlertButton>_opt.buttons[1]).text = '确定';
      if (!_param.showCancelButton) (<AlertButton>_opt.buttons[0]).text = '确定';
    }
  }

  /**
   * 下载app
   */
  downloadApp(): Observable<boolean> {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const appName = APP_DOWNLOAD_URL.substr(APP_DOWNLOAD_URL.lastIndexOf('/') + 1);
    const apk = this.file.externalRootDirectory + appName;
    let num = 0;
    let alertObj = this.alertCtrl.create({
      title: `下载进度：${num}%`,
      enableBackdropDismiss: false,
      buttons: ['后台下载']
    });
    alertObj.present();
    fileTransfer.onProgress((event: ProgressEvent) => {
      num = Math.floor(event.loaded / event.total * 100);
      if (num === 100) {
        alertObj.dismiss();
      } else {
        let title = document.getElementsByClassName('alert-title')[0];
        title && (title.innerHTML = '下载进度：' + num + '%');
      }
    });
    return Observable.fromPromise(fileTransfer.download(APP_DOWNLOAD_URL, apk)).mergeMap(() => {
      return Observable.fromPromise(this.fileOpener.open(apk, 'application/vnd.android.package-archive'))
        .map(() => {
          return true;
        });
    });
  }
}