import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  footerList = [
    // { text:'收藏', value:1, icon: 'shoucang'},
    { text: '清除', value: 2, icon: 'qingchu' },
    { text: '复制', value: 3, icon: 'fuzhi' },
    { text: '分享', value: 4, icon: 'fenxiang' }
  ];

  constructor( private event: Events
    ) { }

  ngOnInit(): void {
  }

  ionViewDidEnter() {
    let arr = document.querySelectorAll('.tab-button');
    Array.from(arr).map( v => {
      v.addEventListener('touchstart', ()=> {
        this.event.publish('tabChange', Number(v.id[v.id.length - 1]));
      });
    });
  }

}
