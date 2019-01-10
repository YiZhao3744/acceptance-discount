import { Component, OnInit } from '@angular/core';
import { Screenshot } from '@ionic-native/screenshot';
import { Observable } from 'rxjs';
import { LoadingController, ToastController, ActionSheetController } from 'ionic-angular';
import { mergeMap, map } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Component({
  selector: 'app-share',
  templateUrl: 'share.component.html',
})
export class ShareComponent implements OnInit {
  
  url: string;
  aa = `<img [src]='../../assets/imgs/wechat.png'/>分享到好友`;
  wechat = `<p [innerHTML]=${this.aa}></p>`;

  constructor(
    private screenshot: Screenshot,
    private loadingCtrl: LoadingController,
    private toast: ToastController,
    private action: ActionSheetController,
    private sanitizer: DomSanitizer
    ) { 

    }


  ngOnInit() {
  }

  onShare() {
    const loading = this.loadingCtrl.create({
      content: '保存截图中···',
      cssClass: 'cus-toast',
    });
    // loading.present();
    const toast = this.toast.create({
      message:'截图已保存',
      duration: 2000,
      cssClass: 'cus-toast',
      position: 'middle',
    });
    this.showActionSheet();
    Observable.fromPromise(this.screenshot.URI(50))
      .pipe(
        map((v: any) => {
          this.url = v.uri || v.URI;
          alert(this.url.length);
        }),
        mergeMap(() => {
          return Observable.fromPromise(this.screenshot.save('jpg', 50));
        }))
      .subscribe(() => {
        loading.dismiss();
        toast.present();
        toast.onDidDismiss(() => {
         this.showActionSheet();
        });
      }, () => {
        // const toast = this.toast.create({
        //   message:'截图保存失败',
        //   duration: 2000,
        //   cssClass: 'cus-toast',
        //   position: 'middle',
        // });
        // toast.present();
      });
  }

  showActionSheet() {
    let actionSheet = this.action.create({
      cssClass:'share-action',
      buttons: [
        {
          text: '分享到好友',
          cssClass:'iconfont icon-wechat',
          handler: () => {
            console.log('分享到好友');
          }
        },
        {
          text: '分享到朋友圈',
          cssClass:'iconfont icon-wechat_timeline',
          handler: () => {
            console.log('分享到朋友圈');
          }
        }
      ],
      
    });
    actionSheet.present();
  }

  assembleHTML(url: any) {
    return this.sanitizer.bypassSecurityTrustHtml(url);
  }

}
