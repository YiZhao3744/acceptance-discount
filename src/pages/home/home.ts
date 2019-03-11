import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import * as moment from 'moment';
import { NavController, AlertController, DateTime, Toast, Content, Events, Platform, Segment } from 'ionic-angular';
import { CounterPage } from '../counter/counter';
import { Clipboard } from '@ionic-native/clipboard';
import { Observable } from 'rxjs';
import { HttpService } from '../../provoders/http.service';
import { NativeService } from '../../provoders/native.service';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { Helper } from '../../provoders/helper';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {

  formlist1 = [
    { label: '票面金额', value: null, unit: '万元', holder: '请输入金额' },
    { label: '年利率', value: null, isRate: true, isYear: true, unit: '%', holder: '请输入年利率' },
    { label: '月利率', value: null, isRate: true, isMonth: true, unit: '‰', holder: '请输入月利率' },
    { label: '手续费', value: null, unit: '元/十万', holder: '请输入手续费' },
    // { label: '打款费', value: null, unit: '元', holder: '请输入打款费' }
  ];
  formlist2 = [
    { label: '每十万扣费', value: null, unit: '元', holder: '请输入金额' },
  ];

  list = [
    { text: '按利率计算', value: 'rate', actived: true },
    { text: '按每十万计算', value: 'lac', actived: false }
  ]

  formlist = [];
  isLac = false;
  dateStart: string;
  dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  startDay;
  endDay;
  dateEnd: string;
  isEndRed = false;
  isStartRed = false;
  addDay = 0;
  cards: any[] = [];
  cards1 = [
    [{ title: '计息天数', canAdd: false, value: '--', unit: '天' },
    { title: '每十万贴息', canAdd: true, value: '--', unit: '元' }],
    [{ title: '贴现利息', canAdd: true, value: '--', unit: '元' },
    { title: '贴现金额', canAdd: true, value: '--', unit: '元' }]
  ];

  btnlist = [
    { text: '一年电', value: 1, actived: true },
    { text: '半年电', value: 2, actived: false },
    { text: '纸票', value: 3, actived: false }
  ];

  cards2 = [
    [{ title: '计息天数', canAdd: false, value: '--', unit: '天' },
    { title: '折合年利率', canAdd: false, value: '--', unit: '%' }],
    [{ title: '折合月利率', canAdd: false, value: '--', unit: '‰' }]
  ];

  @ViewChild('startTime') startTime: DateTime;
  @ViewChild('endTime') endTime: DateTime;

  segment = 'rate';
  remark = null;

  holidayStart: string = '';
  holidayEnd: string = '';
  browserIns: InAppBrowserObject;
  dayCache;
  activeBtn;
  maxDay = moment().add(1, 'year').format('YYYY-MM-DD');
  minDay = moment().add(-2, 'year').format('YYYY-MM-DD');
  _ytoast: Toast;
  _mtoast: Toast;
  isIos = false;
  isIosMax = false;
  isIhoneX = false;
  isHuaweiP10 = false;
  isIPhoneXR = false;

  @ViewChild(Content) content: Content;
  @ViewChild('layout') layout: ElementRef;

  @ViewChild('segElem') segElem: ElementRef;
  @ViewChild('mitem') mitem: ElementRef;
  @ViewChild('cardsElem') cardsElem: ElementRef;

  
  layerHeight = '';
  layerMarginTop = '';
  boxHeight = '';
  contentHeight = 0;
  contentElem: HTMLDivElement;
  mitemHeight: string = '';
  mitemlist = [];
  cardsHieght: string = '';


  constructor(
    private navCtrl: NavController,
    private clipboard: Clipboard,
    private alert: AlertController,
    private service: HttpService,
    private nativeService: NativeService,
    private inAppBrowser: InAppBrowser,
    private keyboard: Keyboard,
    private event: Events,
    private platform: Platform,
    private renderer: Renderer,
  ) {
  }

  isMax() {
    let isp = /iphone/gi.test(window.navigator.userAgent),
      dpr = window.devicePixelRatio,
      dpi = window.devicePixelRatio,
      w = window.screen.width,
      h = window.screen.height;

    this.isIhoneX = isp && dpr && dpi === 3 && w === 375 && h === 812;

    // iPhone XS Max
    this.isIosMax = isp && dpr && dpi === 3 && w === 414 && h === 896;

    // iPhone XR
    this.isIPhoneXR = isp && dpr && dpi === 2 && w === 414 && h === 896;
    this.isIos = this.platform.is('ios');
    this.isHuaweiP10 = this.platform['_isHuaweiP10'];
  }

  ngOnInit() {
    this.isMax();
    this.event.subscribe('tabChange', (index: number) => {
      this.getTools(index);
    });
    this.formlist = this.formlist1;
    this.cards = this.cards1;
    this.activeBtn = this.btnlist[0];
    this.initDate();
    
    this.keyboard.onKeyboardWillShow().subscribe(() => {
      this.event.publish('hideTabs');
      this.setHeight();
    });
    this.keyboard.onKeyboardWillHide().subscribe(() => {
      this.event.publish('showTabs');
      setTimeout(() => {
        this.content.scrollTo(0, 0);
      }, 0);
    });
  }

  setHeight() {
    if (!this.mitemlist.length) this.mitemlist = Array.from(document.querySelectorAll('.mitem'));
    // if (!this.contentHeight) this.contentHeight = this.content.scrollHeight;
    // if (!this.contentElem) this.contentElem = document.querySelector('.scroll-content');
    this.mitemlist.map(v => {
      this.renderer.setElementStyle(v, 'min-height', this.mitemHeight);
    });
    this.renderer.setElementStyle(this.cardsElem.nativeElement, 'height', this.cardsHieght);
  }

  ionViewWillEnter() {
    const h = this.segElem.nativeElement.clientHeight;
    this.layerMarginTop = `${h + 10}px`;
    this.layerHeight = `calc( 100% - ${h + 10}px )`;
    this.boxHeight = `calc(( 100% - ${h + 10}px ) / 2)`;
  }

  ionViewDidEnter() {
    this.mitemHeight = `${this.mitem.nativeElement.clientHeight}px !important`;
    this.cardsHieght = `${this.cardsElem.nativeElement.clientHeight}px !important`;
    this.setHeight();
  }

  onClickBtn(item) {
    this.activeBtn = item;
    this.btnlist.map(v => {
      v.actived = false;
    });
    item.actived = true;
    if (this.activeBtn.value === 2) {
      this.dateEnd = moment(this.dateStart).add(.5, 'year').format('YYYY-MM-DD');
    } else if (this.activeBtn.value === 3) {
      this.dateEnd = moment(this.dateStart).add(.5, 'year').format('YYYY-MM-DD');
    } else {
      this.dateEnd = moment(this.dateStart).add(1, 'year').format('YYYY-MM-DD');
    }
    this.getHoliday();
  }

  showDatePicker() {
    const minDay = this.platform.is('ios') ? new Date(this.minDay).valueOf() : (new Date(this.minDay)).valueOf();
    const maxDay = this.platform.is('ios') ? new Date(moment().add(1, 'year').format('YYYY')) : (new Date(this.maxDay)).valueOf();
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      locale: 'zh-CN',
      minDate: minDay,
      maxDate: maxDay,
      doneButtonLabel: '确定',
      cancelButtonLabel: '取消',
      okText: '确定',
      cancelText: '取消',
      popoverArrowDirection: 'up',
      cancelButtonColor: '#222',
      doneButtonColor: '#488aff',
      titleText: '', // android
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT
    }).then(
      date => alert('Got date: '+ date),
      err => alert('Error occurred while getting date: '+ err)
    );
  }

  initDate() {
    this.dateStart = moment(new Date()).format('YYYY-MM-DD');
    this.dateEnd = moment(new Date()).add(1, 'year').format('YYYY-MM-DD');
    if (this.startTime) this.startTime.setValue(this.dateStart);
    if (this.endTime) this.endTime.setValue(this.dateEnd);
    this.getHoliday();
  }

  getHoliday() {
    Observable.forkJoin(
      this.service.post('api/holiday', { nowTime: this.dateStart }),
      this.service.post('api/holiday', { nowTime: this.dateEnd })
    ).subscribe((res: any) => {
      if (res[0].code === 0 || res[1].code === 0) {
        if (res[0].code === 0) {
          this.startDay = res[0].holiday.weekDayStr || '';
          this.holidayStart = res[0].holiday.holidayName || '';
        }
        if (res[1].code === 0) {
          this.endDay = res[1].holiday.weekDayStr || '';
          this.holidayEnd = res[1].holiday.holidayName || '';
          this.addDay = res[1].holiday.addDay || 0;
          this.setDays();
        }
        this.isStartRed = this.startDay === '星期六' || this.startDay === '星期日';
        this.isEndRed = this.endDay === '星期六' || this.endDay === '星期日';
      } else {
        this.requestOnError();
        this.setDays();
      }
    }, err => {
      console.log(err);
      this.requestOnError();
      this.setDays();
    });
  }

  requestOnError() {
    this.getWeek();
    if (!this.isEndRed) {
      this.addDay = 0;
      return;
    }
    switch (this.endDay) {
      case '星期六':
        this.addDay = 2;
        break;
      case '星期日':
        this.addDay = 1;
        break;
      default:
        this.addDay = 0;
    }
  }

  setDays(flag: boolean = true) {
    const start = new Date(this.dateStart);
    const now = new Date(this.dateEnd);
    const days = now.getTime() - start.getTime();
    this.getAddDay();
    const day = parseInt(String(days / (1000 * 60 * 60 * 24))) + this.addDay;
    this.dayCache = day;
    if (!flag) this.cards[0][0].value = day;
    else {
      if (this.activeBtn.value === 2) {
        this.cards[0][0].value = this.dayCache;
      } else if (this.activeBtn.value === 3) {
        this.addDay += 3;
        this.cards[0][0].value = this.dayCache + 3;
      } else {
        this.cards[0][0].value = this.dayCache;
      }
    }
    this.calculate();
  }

  getAddDay() {
    let str = String(this.addDay);
    if (str.length > 1 && str[0] === '0') {
      this.addDay = Number(str.substr(1));
    } else {
      this.addDay = Number(str);
    }
  }

  getWeek() {
    const si = new Date(this.dateStart).getDay();
    this.startDay = this.dayNames[si];
    this.isStartRed = si === 0 || si === 6 || false;
    if (!this.dateEnd) return;
    const ei = new Date(this.dateEnd).getDay();
    this.endDay = this.dayNames[ei];
    this.isEndRed = ei === 0 || ei === 6 || false;
  }

  onPickDate() {
    if (new Date(this.dateEnd).getTime() < new Date(this.dateStart).getTime()) {
      this.nativeService.showToast('到期日期不能小于贴现日期').present();
      this.initDate();
      return;
    }
    setTimeout(() => {
      this.getHoliday();
      this.calculate();
    }, 50);
  }

  onIncres() {
    if (this.addDay === 0) return;
    this.addDay -= 1;
    this.setDays(false);
  }

  onAdd() {
    this.addDay += 1;
    this.setDays(false);
  }

  onInputChange(item) {
    alert(item.value);
    // item.value = item.value.replace(/[^[0-9]+([.]{1}[0-9]+){0,1}$/);
    if (item.isRate) {
      if (item.value === '') {
        this.formlist1[2].value = null;
        this.formlist1[1].value = null;
      }
    }
    this.getLac();
  }

  getLac() {
    if (this.segment === 'lac') {
      // 折合年利率 = 十万扣费*360 / 计息天数 /100000*100
      // tslint:disable-next-line:triple-equals
      if (this.formlist2[0].value == '' || this.formlist2[0].value == null) {
        this.cards[0][1].value = '--';
        this.cards[1][0].value = '--';
        return;
      }
      const a = this.formlist2[0].value * 360 / this.cards[0][0].value;
      const b = a / 100000 * 100;
      this.cards[0][1].value = Helper.numFormat(parseFloat((Math.round(b * Math.pow(10, 2)) / Math.pow(10, 2)).toString()));

      // 折合月利率 = 十万扣费*360/计息天数/100000*100/1.2
      this.cards[1][0].value = Helper.numFormat(parseFloat((Math.round(b / 1.2 * Math.pow(10, 2)) / Math.pow(10, 2)).toString()));
    }
  }

  getRate(item) {
    if (!item.isRate) return;
    if (item.value !== '') {
      if (item.isYear) {
        let val = Math.round((Number(item.value) / 1.2) * Math.pow(10, 4)) / Math.pow(10, 4);
        this.formlist1[2].value = parseFloat(val.toString());
        if ((Number(item.value) < 0 || Number(item.value) > 100) && !this._ytoast) {
          this._ytoast = this.nativeService.showToast('年利率应在0~100之间');
          this._ytoast.present();
          this._ytoast.onDidDismiss(() => {
            this._ytoast = null;
          });
        }
      } else {
        let val = Math.round((item.value * 1.2) * Math.pow(10, 4)) / Math.pow(10, 4);
        this.formlist1[1].value = parseFloat(val.toString());
        if ((Number(item.value) < 0 || Number(item.value) > 83.33) && !this._mtoast) {
          this._mtoast = this.nativeService.showToast('月利率应在0~83.33之间');
          this._mtoast.present();
          this._mtoast.onDidDismiss(() => {
            this._mtoast = null;
          });
        }
      }
    }
  }

  // 按利率计算
  calculate(item?: any) {
    // if (this.keyboard.isVisible) {
    //   this.keyboard.hide();
    // }
    if (this.isLac) return this.getLac();

    // tslint:disable-next-line:triple-equals
    // 每十万贴息=100000*年利率/360/100*计息天数+每十万手续费
    // 年利率=每十万扣费*360/计息天数/100000
    // 月利率=年利率/12
    // 贴现利息= （100000*年利率/360/100*计息天数+每十万手续费）*票面金额/10
    // 贴现金额 = 票面金额*10000（100000*年利率/360/100*计息天数+每十万手续费）*票面金额/10

    // 贴现利息 =（100000*年利率/360/100*计息天数+手续费）*票面金额/10
    const c = this.formlist1[1].value;
    if (c == '' || c == null) return;
    const a = (100000 * c) / 360 / 100;
    const ss = this.formlist1[3].value || 0;
    const b = a * this.cards[0][0].value + Number(ss);
    if (isNaN(b)) return;

    // 每十万贴息
    // 100000*年利率/360/100*计息天数+手续费
    this.cards[0][1].value = Helper.numFormat(parseFloat((Math.round(b * Math.pow(10, 2)) / Math.pow(10, 2)).toString()));
    // tslint:disable-next-line:triple-equals
    if (this.formlist1[0].value == '' || this.formlist1[0].value == null) {
      // this.clearCard();
      return;
    }
    // 贴现利息 =（100000*年利率/360/100*计息天数+手续费）*票面金额/10
    const d = b * this.formlist1[0].value / 10;
    this.cards[1][0].value = Helper.numFormat(parseFloat((Math.round(d * Math.pow(10, 2)) / Math.pow(10, 2)).toString()));

    if (this.formlist1[0].value >= 1000000) {
      this.nativeService.showToast('最多输入六位票面金额').present();
      this.formlist1[0].value = null;
      return;
    }
    // tslint:disable-next-line:triple-equals
    if (this.formlist1[1].value == '' || this.formlist1[1].value == null) {
      this.clearCard();
      return;
    }

    // 贴现金额= 票面金额*10000 - 贴现利息
    // const m = this.formlist1[4].value || 0;
    const val = Helper.transform(String(this.cards[1][0].value));
    const e = this.formlist1[0].value * 10000 - val;
    const f = e;
    this.cards[1][1].value = Helper.numFormat(parseFloat((Math.round(f * Math.pow(10, 2)) / Math.pow(10, 2)).toString()));
  }

  clearCard() {
    this.cards[1][0].value = '--';
    if (this.cards[1][1]) this.cards[1][1].value = '--';
    this.cards[0][1].value = '--';
  }

  // 按每十万扣费计算
  segmentChanged(item: Segment) {
    switch (item.value) {
      case 'lac':
        this.cards2[0][0].value = this.cards1[0][0].value;
        this.formlist = this.formlist2;
        this.cards = this.cards2;
        this.isLac = true;
        break;
      case 'rate':
        this.cards1[0][0].value = this.cards2[0][0].value;
        this.formlist = this.formlist1;
        this.cards = this.cards1;
        this.isLac = false;
        break;
    }
    this.btnlist.map(v => {
      v.actived = false;
    });
    this.btnlist[0].actived = true;
    this.activeBtn = this.btnlist[0];
    this.initDate();
  }

  onSkip(item) {
    this.navCtrl.push(CounterPage, {
      value: item.value
    });
  }

  getTools(item: any) {
    switch (item) {
      case 0:
        // this.showConfirm();
        this.btnlist.map(v => {
          v.actived = false;
        });
        this.btnlist[0].actived = true;
        this.activeBtn = this.btnlist[0];
        this.clear();
        this.clearCard();
        break;
      case 1:
        this.doCopy();
        break;
      case 2:
        this.nativeService.onShare();
        break;
    }
  }

  doCopy() {
    let str: string;
    if (this.segment === 'rate') {
      str =
        // `      备注: ${this.remark || '--'}
        `      票据金额: ${this.formlist[0].value || '--'}万元
      年利率: ${this.formlist[1].value || '--'}%
      月利率: ${this.formlist[2].value || '--'}‰
      手续费: ${this.formlist[3].value || '--'}元/十万
      贴现日期: ${this.dateStart}
      到期日期: ${this.dateEnd}
      调整天数: ${this.addDay}天
      计息天数: ${this.cards[0][0].value}天
      每十万贴息: ${this.cards[0][1].value || '--'}元
      贴现利息: ${this.cards[1][0].value || '--'}元
      贴现金额: ${this.cards[1][1].value || '--'}元`
    } else {
      str =
        // `      备注: ${this.remark || '--'}
        `      十万扣费: ${this.formlist[0].value || '--'}元
      折合年利率: ${this.cards[0][1].value || '--'}%
      折合月利率: ${this.cards[1][0].value || '--'}‰
      贴现日期: ${this.dateStart}
      到期日期: ${this.dateEnd}
      调整天数: ${this.addDay}天
      计息天数: ${this.cards[0][0].value}天`;
    }
    this.clipboard.copy(str).then(() => {
      this.nativeService.showToast('复制成功！').present();
    });
  }

  skipToTools() {
    this.browserIns = this.inAppBrowser.create('http://www.saihujinrong.com/calc/index.html#/tools', '_self', {
      location: 'no',
      zoom: 'no',
      hideurlbar: 'no',
      navigationbuttoncolor: 'white',
      toolbarcolor: '#ab253a',
      hidenavigationbuttons: 'no',
    });
    window['myBrowser'] = this.browserIns;
    // this.browserIns.executeScript({
    //   code: `const toolBox = document.createElement('div');
    //   toolBox.className = 'tool-box';
    //   const title = document.createElement('span');
    //   const back = document.createElement('span');
    //   back.className = 'back iconfont icon-back';
    //   title.className = 'title';
    //   title.innerText = '工具箱';
    //   back.addEventListener('touchstart', function() {
    //     window['myBrowser'].hide();
    //   },false);
    //   toolBox.appendChild(title);
    //   toolBox.appendChild(back);
    //   document.body.appendChild(toolBox);`
    // }).then(() => {
    //   this.browserIns.insertCSS({
    //     file: '../../assets/libs/tool.css'
    //   }).catch(err => {
    //     console.log(err);
    //   });
    // });

    this.browserIns.on('loadstart').subscribe(res => {
      alert(res + 'start');
      alert(JSON.stringify(res));
      if (res.url.match("mobile/close")) {
        this.browserIns.close();
      }
    }, err => {
      alert(err + 'start');
      alert(JSON.stringify(err));
    });
    this.browserIns.on('loadstop').subscribe(res => {
      alert(res + 'stop');
      alert(JSON.stringify(res));
      this.test();
    }, err => {
      alert(err + 'stop');
      alert(JSON.stringify(err));
    });

    window.onhashchange = function () {
      alert('url  changed');
    }

    this.browserIns.on('loaderror').subscribe(res => {
      alert(res + 'error');
      alert(JSON.stringify(res));
    }, err => {
      alert(err + 'err');
      alert(JSON.stringify(err));
    });
    this.browserIns.on('exit').subscribe(res => {
      alert(res + 'exit');
      alert(JSON.stringify(res));
    }, err => {
      alert(err + 'exit');
      alert(JSON.stringify(err));
    });
  }

  test() {
    const toolBox = document.createElement('div');
    toolBox.className = 'tool-box';
    const title = document.createElement('span');
    const back = document.createElement('span');
    back.className = 'back iconfont icon-back';
    title.className = 'title';
    title.innerText = '工具箱';
    back.addEventListener('touchstart', function () {
      window['myBrowser'].hide();
    }, false);
    toolBox.appendChild(title);
    toolBox.appendChild(back);
    document.body.appendChild(toolBox);
    alert(title);
    alert(JSON.stringify(document));

  }

  showConfirm() {
    this.alert.create({
      subTitle: '一键清除',
      message: '清除后不可恢复，确定清除吗？',
      buttons: [
        {
          text: '取消',
          role: 'cancel'
        },
        {
          text: '确定',
          handler: () => {
            this.btnlist.map(v => {
              v.actived = false;
            });
            this.btnlist[0].actived = true;
            this.activeBtn = this.btnlist[0];
            this.clear();
            this.clearCard();
          }
        }
      ]
    }).present();
  }

  clear() {
    this.remark = null;
    this.addDay = 0;
    this.formlist.map(v => {
      v.value = null;
    });
    this.initDate();
  }

}
