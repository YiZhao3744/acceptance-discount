import { Injectable } from "@angular/core";
import { Screenshot } from "@ionic-native/screenshot";
import { LoadingController, ToastController, ActionSheetController } from "ionic-angular";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

@Injectable()
export class shareService {
    private url: string;
    constructor(
        private screenshot: Screenshot,
        private loadingCtrl: LoadingController,
        private toast: ToastController,
        private action: ActionSheetController,
    ) { }

    onShare() {
        Observable.fromPromise(this.screenshot.URI(50))
            .pipe(
                map((v: any) => {
                    this.url = v.uri || v.URI;
                }),
                mergeMap(() => {
                    return Observable.fromPromise(this.screenshot.save('jpg', 50));
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
                {
                    text: '分享到朋友圈',
                    cssClass: 'iconfont icon-wechat_timeline',
                    handler: () => this.shareToTimeLine()
                }
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
            this.showToast('分享成功').present();
        }, (reason: any) => {
            this.showToast('分享失败：' + reason).present();
        });
    }

    showToast(msg = '') {
        return this.toast.create({
            message: msg,
            duration: 2000,
            cssClass: 'cus-toast',
            position: 'middle',
        });
    }

    private shareToTimeLine() {
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
            scene: wechat.Scene.TIMELINE
        }, () => {
            this.showToast('分享成功').present();
        }, (reason: any) => {
            this.showToast('分享失败: ' + reason).present();
        });
    }
}