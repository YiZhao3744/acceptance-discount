import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ToastController, NavController, AlertController } from 'ionic-angular';
import { CounterPage } from '../counter/counter';
import { Clipboard } from '@ionic-native/clipboard';
import { Observable } from 'rxjs';
import { HttpService } from '../../provoders/http.service';
import { shareService } from '../../provoders/share.service';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {

  formlist1 = [
    { label: '票面金额', value: null, unit: '万元', holder: '请输入金额' },
    { label: '年利率', value: null, isYear: true, unit: '%', holder: '请输入年利率' },
    { label: '月利率', value: null, unit: '‰', holder: '' },
    { label: '手续费', value: null, unit: '元/十万', holder: '请输入手续费' },
    { label: '打款费', value: null, unit: '元', holder: '请输入打款费' }
  ];
  formlist2 = [
    { label: '每十万扣费', value: null, unit: '元', holder: '请输入金额' },
  ];

  list = [
    { text: '按利率计算', value: 'kk' },
    { text: '按每十万扣费计算', value: 'pp' }
  ]

  formlist = [];

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

  cards2 = [
    [{ title: '计息天数', canAdd: false, value: '--', unit: '天' },
    { title: '折合年利率', canAdd: false, value: '--', unit: '%' }],
    [{ title: '折合月利率', canAdd: false, value: '--', unit: '‰' }]
  ];

  @ViewChild('btn') btn: ElementRef;
  segment = 'kk';
  ticket = null;

  footerList = [
    // { text:'收藏', value:1, icon: 'shoucang'},
    { text: '清除', value: 2, icon: 'qingchu' },
    { text: '复制', value: 3, icon: 'fuzhi' },
    { text: '分享', value: 4, icon: 'fenxiang' }
  ];

  holidayStart: string = '';
  holidayEnd: string = '';
  browserIns: InAppBrowserObject;

  constructor(
    private toast: ToastController,
    private navCtrl: NavController,
    private clipboard: Clipboard,
    private alert: AlertController,
    private service: HttpService,
    private shareService: shareService,
    private inAppBrowser: InAppBrowser
  ) {
  }

  ngOnInit() {
    this.formlist = this.formlist1;
    this.cards = this.cards1;
    this.initDate();
  }

  initDate() {
    this.dateStart = moment(new Date()).format('YYYY-MM-DD');
    this.dateEnd = moment(new Date()).add(1, 'year').format('YYYY-MM-DD');
    // this.getWeek();
    this.getHoliday();
  }

  getHoliday() {
    Observable.forkJoin(
      this.service.post('api/holiday', { nowTime: this.dateStart }),
      this.service.post('api/holiday', { nowTime: this.dateEnd })
    ).subscribe((res: any) => {
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
      this.isStartRed = this.startDay === '星期六' || this.startDay === '星期天';
      this.isEndRed = this.endDay === '星期六' || this.endDay === '星期天';
    }, err => {
      console.log(err);
    })
  }

  setDays() {
    const start = new Date(this.dateStart);
    const now = new Date(this.dateEnd);
    const days = now.getTime() - start.getTime();
    // tslint:disable-next-line:radix
    const day = parseInt(String(days / (1000 * 60 * 60 * 24))) + this.addDay;
    this.cards[0][0].value = day;
    this.calculate();
  }

  getWeek() {
    const si = new Date(this.dateStart).getDay();
    this.startDay = this.dayNames[si];
    this.isStartRed = si === 0 || si === 6 || false;
    if (!this.dateEnd) { return; }
    const ei = new Date(this.dateEnd).getDay();
    this.endDay = this.dayNames[ei];
    this.isEndRed = ei === 0 || ei === 6 || false;
  }

  onPick() {
    if (new Date(this.dateStart).getTime() > new Date(this.dateEnd).getTime()) {
      const t = this.toast.create({
        message: '贴现日期不能大于到期日期',
        duration: 3000,
        cssClass: 'cus-toast',
        position: 'middle',
      });
      t.present();
      return;
    }
    setTimeout(() => {
      this.getHoliday();
      this.calculate();
    }, 50);
  }

  onIncres() {
    if (this.addDay === 0) { return; }
    this.addDay -= 1;
    this.setDays();
  }

  onAdd() {
    this.addDay += 1;
    this.setDays();
  }

  // 按利率计算
  calculate(item?: any) {
    // tslint:disable-next-line:triple-equals
    if (this.segment == 'pp') {
      // 折合年利率 = 十万扣费*360 / 计息天数 /100000*100
      // tslint:disable-next-line:triple-equals
      if (this.formlist2[0].value == '' || this.formlist2[0].value == null) {
        this.cards[0][1].value = '--';
        this.cards[1][0].value = '--';
        return;
      }
      const a = this.formlist2[0].value * 360 / this.cards[0][0].value;
      const b = a / 100000 * 100;
      this.cards[0][1].value = b.toFixed(8);

      // 折合月利率 = 十万扣费*360/计息天数/100000*100/1.2
      this.cards[1][0].value = (b / 1.2).toFixed(8);

    } else {
      if (item && item.isYear && item.value) {
        this.formlist1[2].value = (item.value / 12).toFixed(8);
      }
      // tslint:disable-next-line:triple-equals
      if (this.formlist1[0].value == '' || this.formlist1[0].value == null) {
        this.clearCard();
        return;
      }
      // tslint:disable-next-line:triple-equals
      if (this.formlist1[1].value == '' || this.formlist1[1].value == null) {
        this.clearCard();
        return;
      }

      // 贴现利息 =（100000*年利率/360/100*计息天数+手续费）*票面金额/10
      const c = this.formlist1[1].value;
      const a = (100000 * c) / 360 / 100;
      const b = a * this.cards[0][0].value + this.formlist1[3].value;
      const d = b * this.formlist1[0].value / 10;
      this.cards[1][0].value = d.toFixed(2);

      // 贴现金额= 票面金额*10000 - 贴现利息 - 打款费
      const m = this.formlist1[4].value || 0;
      const e = this.formlist1[0].value * 10000 - this.cards[1][0].value;
      const f = e - m;
      this.cards[1][1].value = f;

      // 每十万贴息
      this.cards[0][1].value = (d * 10).toFixed(2);
    }

  }

  clearCard() {
    this.cards[1][0].value = '--';
    if (this.cards[1][1]) this.cards[1][1].value = '--';
    this.cards[0][1].value = '--';
  }

  // 按每十万扣费计算
  segmentChanged(item: any) {
    // tslint:disable-next-line:triple-equals
    // debugger; 
    // if (this.segment == item.value) { return; }
    switch (item.value) {
      case 'pp':
        this.cards2[0][0].value = this.cards1[0][0].value;
        this.formlist = this.formlist2;
        this.cards = this.cards2;
        break;
      case 'kk':
        this.cards1[0][0].value = this.cards2[0][0].value;
        this.formlist = this.formlist1;
        this.cards = this.cards1;
        break;
    }
  }

  onSkip(item) {
    this.navCtrl.push(CounterPage, {
      value: item.value
    });
  }

  getTools(item: any, btn) {
    console.log(btn);
    switch (item.value) {
      case 1:

        break;
      case 2:
        this.showConfirm();
        break;
      case 3:
        this.doCopy();
        break;
      case 4:
        this.shareService.onShare();
        break;
    }
  }

  doCopy() {
    let str: string;
    if(this.segment === 'kk') {
      str = 
      `票号: ${this.ticket || '-'}
      票据金额: ${this.formlist[0].value || '-' }万元
      年利率: ${this.formlist[1].value || '-'}%
      月利率: ${this.formlist[2].value || '-'}‰
      手续费: ${this.formlist[3].value || '-'}元/十万
      打款费: ${this.formlist[4].value || '-'}元
      贴现日期: ${this.dateStart}
      到期日期: ${this.dateEnd}
      调整天数: ${this.addDay}天
      计息天数: ${this.cards[0][0].value}天
      每十万贴息: ${this.cards[0][1].value || '--'}元
      贴现利息: ${this.cards[1][0].value || '--'}元
      贴现金额: ${this.cards[1][1].value || '--'}元`
    } else {
      str = 
      `票号: ${this.ticket || '-'}
      十万扣费: ${this.formlist[0].value || '-' }元
      折合年利率: ${this.cards[0][1].value || '--'}%
      折合月利率: ${this.cards[1][0].value || '--'}‰
      贴现日期: ${this.dateStart}
      到期日期: ${this.dateEnd}
      调整天数: ${this.addDay}天
      计息天数: ${this.cards[0][0].value}天`;
    }
    this.clipboard.copy(str).then(() => {
      this.shareService.showToast('复制成功！').present();
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
            this.clear();
            this.clearCard();
          }
        }
      ]
    }).present();
  }

  clear() {
    this.ticket = null;
    this.addDay = 0;
    this.formlist.map(v => {
      v.value = null;
    });
    this.initDate();
  }

}
