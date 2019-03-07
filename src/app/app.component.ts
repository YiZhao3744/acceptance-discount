import { Component, Renderer2 } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Keyboard } from '@ionic-native/keyboard';
import { TabsPage } from '../pages/tabs/tabs';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, render: Renderer2,
    splashScreen: SplashScreen, keyboard: Keyboard) {
    platform.ready().then(() => {
      const isHuaweiP10 = window.navigator.userAgent.includes('VTR-AL00');
      const docel = document.documentElement || document.body;
      if (isHuaweiP10) {
        render.setStyle(docel, 'fontSize', '50%');
      }
      platform['_isHuaweiP10'] = isHuaweiP10;
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleBlackTranslucent();
      statusBar.backgroundColorByHexString('#ab253a');
      splashScreen.hide();
      keyboard.hideFormAccessoryBar(false);
    });
  }
}

