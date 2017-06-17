import { ConfigService } from '../services/config.svc.js';
import { NotificationService } from '../services/notification.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class FooterComponent {
  
  constructor(vnode){
    this.notification = new NotificationService();
    this.config = new ConfigService();
    this.message = vnode.attrs.message;
  }
  
  view(vnode) {
    this.message = vnode.attrs.message;
    return m('footer', [
      this.notification.display(),
      m('.version', m.trust(`LitePad v${this.config.version} &mdash; &copy; 2017 Fabio Cevasco`))
    ]); 
  }
}
