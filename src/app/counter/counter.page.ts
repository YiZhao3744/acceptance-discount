import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.page.html',
  styleUrls: ['./counter.page.scss'],
})
export class CounterPage implements OnInit {

  list = [];
  className = '';
  originValue = '';
  preValue = '';
  currentValue = '';
  result: number;
  operation = '';
  isCounted = false;

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    this.createList();
  }

  createList() {
    this.list = [
      { items: ['C'], opt: [], isBack: true },
      { items: ['1', '2', '3'], opts: ['×'] },
      { items: ['4', '5', '6'], opts: ['÷'] },
      { items: ['7', '8', '9'], opts: ['-'] },
      { items: ['0', '.'], opts: ['+', '＝'] },
    ];
  }

  goBack() {
    this.navCtrl.goBack();
  }

  clear() {
    this.preValue = '';
    this.currentValue = '';
    this.result = null;
    this.operation = '';
  }

  onStart(item: any, e: any, data: any) {
    if (item === 'C') {
      this.clear();
      return;
    }
    const isOpts = this.isOperation(item, data);
    if (this.isCounted) {
      this.reset(isOpts);
    }
    if (item === '＝') {
      this.doCount();
      return;
    }
    if (!this.operation) {
      if (!isOpts) {
        if (this.canAdd(this.preValue, item)) {
          this.preValue += item;
        }
      } else {
        if (item && item !== '＝' && item !== 'C') { this.operation = item; }
      }
    } else {
      if (!isOpts) {
        if (this.canAdd(this.preValue, item)) {
          this.currentValue += item;
        }
      } else {
        if (item && item !== '＝' && item !== 'C') { this.operation = item; }
      }
    }
    if (data.isBack) {
      if (this.operation) {
        this.currentValue = this.currentValue.substr(0, this.currentValue.length - 1);
      } else {
        this.preValue = this.preValue.substr(0, this.preValue.length - 1);
      }
    }
    this.className = e.target.className;
    if (!data.isBack) {
      e.target.className += ' active';
    }
  }

  canAdd(val: string, item: string): boolean {
    return (val.length || item !== '.') && val[0] !== '.' && val.indexOf('.') < 0;
  }

  reset(isOpts: boolean) {
    if (isOpts) {
      this.preValue = this.result.toString();
      this.result = null;
      this.operation = '';
      this.currentValue = '';
    } else {
      this.clear();
    }
    this.isCounted = false;
  }

  isOperation(val: string, data: any): boolean {
    const opts = ['C', '×', '÷', '-', '+', '＝'];
    return data.isBack || opts.includes(val);
  }

  doCount() {
    switch (this.operation) {
      case '×':
        this.result = Number(this.preValue) * Number(this.currentValue);
        break;
      case '÷':
        this.result = Number(this.preValue) / Number(this.currentValue);
        break;
      case '-':
        this.result = Number(this.preValue) - Number(this.currentValue);
        break;
      case '+':
        this.result = Number(this.preValue) + Number(this.currentValue);
        break;
    }
    this.isCounted = true;
  }

  onEnd(e) {
    e.target.className = this.className;
  }

}
