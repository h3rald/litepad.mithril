import { ConfigService } from '../services/config.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class FooterComponent {
  
  constructor(){
    this.config = new ConfigService();
  }
  
  view() {
    return m('footer', [
      m('.version', m.trust(`LitePad v${this.config.version} &mdash; &copy; 2017 Fabio Cevasco`))
    ]); 
  }
}
