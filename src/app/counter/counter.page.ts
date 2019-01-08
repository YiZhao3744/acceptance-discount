import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

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
  height = '';
  btnHeight = '';

  constructor(private navCtrl: NavController,private router: ActivatedRoute) { }

  ngOnInit() {
    console.log(this.router.snapshot.queryParams['value']);
    this.height = window.innerHeight * .5 / 4 - 22 +'px';
    this.btnHeight = window.innerHeight * .5 / 5 - 14 +'px';
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
      this.reset(isOpts, item);
    }
    if (item === '＝' && this.operation) {
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
    if(!val.length && item === '.') return false;
    const copy = val + item;
    let arr = [];
    for (let i = 0; i < copy.length; i++) {
      if(copy[i] === '.') {
        arr.push(copy[i]);
      }
    }
    return arr.length <= 1 ;
  }

  reset(isOpts: boolean, item:string) {
    if (isOpts) {
      this.preValue = this.result ? this.result.toString() : this.preValue;
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

  onEnd(e: any) {
    e.target.className = this.className;
  }

}
