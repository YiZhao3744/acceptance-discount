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
        const loading = this.loadingCtrl.create({
            content: '保存截图中···',
            cssClass: 'cus-toast',
        });
        const now = new Date().getTime();
        loading.present();
        Observable.fromPromise(this.screenshot.URI(50))
            .pipe(
                map((v: any) => {
                    this.url = v.uri || v.URI;
                }),
                mergeMap(() => {
                    return Observable.fromPromise(this.screenshot.save('jpg', 50));
                }))
            .subscribe(() => {
                const then = new Date().getTime();
                const diff = then - now;
                if (diff <= 1500) {
                    setTimeout(() => {
                        loading.dismiss().then(() => {
                            this.showActionSheet();
                        });
                    }, diff);
                } else {
                    loading.dismiss().then(() => {
                        this.showActionSheet();
                    });
                }
            }, () => {
                loading.dismiss().then(() => {
                    const toast = this.showToast('截图保存失败');
                    toast.present();
                });
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
                title: '承兑贴现计算器',
                description: '商盟订货提供线上商城与进销存完美融合的SaaS系统，为批发商提供PC商城，微商城，专属APP商城，进销存后台，在线支付的一体化解决方案。',
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
                title: '承兑贴现计算器',
                description: '商盟订货提供线上商城与进销存完美融合的SaaS系统，为批发商提供PC商城，微商城，专属APP商城，进销存后台，在线支付的一体化解决方案。',
                thumb: this.url,
                media: {
                    type: wechat.Type.IMAGE,
                    image: this.url
                }
            },
            scene: wechat.Scene.TIMELINE   // share to Timeline
        }, () => {
            this.showToast('分享成功').present();
        }, (reason: any) => {
            this.showToast('分享失败: ' + reason).present();
        });
    }
}