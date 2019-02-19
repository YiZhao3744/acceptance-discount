import { Component, Renderer, ElementRef, ViewChild } from '@angular/core';
import { HomePage } from '../home/home';
import { Events, Tabs } from 'ionic-angular';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  @ViewChild('myTabs') tabRef: Tabs;

  tab1Root = HomePage;
  mb: any;
  
  footerList = [
    // { text:'收藏', value:1, icon: 'shoucang'},
    { text: '清除', value: 2, icon: 'qingchu' },
    { text: '复制', value: 3, icon: 'fuzhi' },
    { text: '分享', value: 4, icon: 'fenxiang' }
  ];

  constructor( private event: Events,
    private elementRef: ElementRef, 
    private renderer: Renderer,
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

  ionViewDidLoad() {
    let tabs = this.queryElement(this.elementRef.nativeElement, '.tabbar');
    this.event.subscribe('hideTabs', () => {
      this.renderer.setElementStyle(tabs, 'display', 'none');
      let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
      let content = this.queryElement(SelectTab, '.scroll-content');
      this.mb = content.style['margin-bottom'];
      this.renderer.setElementStyle(content, 'margin-bottom', '0')
    });
    this.event.subscribe('showTabs', () => {
      this.renderer.setElementStyle(tabs, 'display', '');
      let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
      let content = this.queryElement(SelectTab, '.scroll-content');
      this.renderer.setElementStyle(content, 'margin-bottom', this.mb)
    })
  }
  
  queryElement(elem: HTMLElement, q: string): HTMLElement {
    return <HTMLElement>elem.querySelector(q);
  }

}
