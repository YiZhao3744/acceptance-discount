import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CounterPage } from '../pages/counter/counter';
import { FormsModule } from '@angular/forms';
import { Screenshot } from '@ionic-native/screenshot';
import { Clipboard } from '@ionic-native/clipboard';
import { HttpService } from '../provoders/http.service';
import { HttpClientModule } from '@angular/common/http';
import { NativeService } from '../provoders/native.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { TabsPage } from '../pages/tabs/tabs';

import { DatePicker } from '@ionic-native/date-picker';
import { AppVersion } from '@ionic-native/app-version';
import { Network } from '@ionic-native/network';
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CounterPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      mode: 'ios',
      iconMode: 'ios',
      tabsHideOnSubPages: true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CounterPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Screenshot,
    Clipboard,
    HttpService,
    NativeService,
    InAppBrowser,
    Keyboard,
    DatePicker,
    AppVersion,
    Network,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
