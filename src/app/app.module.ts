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
import { shareService } from '../provoders/share.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CounterPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      mode: 'ios',
      iconMode: 'ios',
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CounterPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Screenshot,
    Clipboard,
    HttpService,
    shareService,
    InAppBrowser,
    Keyboard,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
