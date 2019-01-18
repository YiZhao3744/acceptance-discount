import {
  Observable
} from 'rxjs';

(function () {
debugger;
  const toolBox = document.createElement('div');
  toolBox.className = 'tool-box';
  const title = document.createElement('span');
  const back = document.createElement('span');
  back.className = 'back iconfont icon-back';
  title.className = 'title';
  title.innerText = '工具箱';
  back.addEventListener('touchstart', function() {
    window['myBrowser'].hide();
  },false);
  toolBox.appendChild(title);
  toolBox.appendChild(back);
  document.body.appendChild(toolBox);
})();
