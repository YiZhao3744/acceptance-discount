import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ToastController, NavController } from 'ionic-angular';
import { CounterPage } from '../counter/counter';

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

  dateStart: string = moment(new Date()).format('YYYY-MM-DD');
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

  footerList = [
    { text:'收藏', value:1, icon: 'shoucang'},
    { text:'清除', value:2, icon: 'qingchu'},
    { text:'复制', value:3, icon: 'fuzhi'},
    { text:'分享', value:4, icon: 'fenxiang'}
  ]

  constructor(
    private toast: ToastController,
    private navCtrl: NavController,
  ) {
  }

  ngOnInit() {
    this.formlist = this.formlist1;
    this.cards = this.cards1;
    const now = new Date().getTime();
    const oneyear = 1000 * 60 * 60 * 24 * 365;
    this.dateEnd = moment(new Date(now + oneyear)).format('YYYY-MM-DD');
    this.getWeek();
    this.setDays();
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
      this.getWeek();
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
    this.cards[1][1].value = '--';
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
}
