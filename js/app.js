import { m } from '../vendor/js/mithril.js';
import { CodeFlask } from '../vendor/js/codeflask.js'; 
import { ConfigService } from './services/config.svc.js';
import { HomeComponent } from './components/home.cmp.js';
import { ViewNoteComponent } from './components/viewnote.cmp.js';

function init() {
  m.route(document.body, '/home', {
    '/home': HomeComponent,
    '/view/:id': ViewNoteComponent
  });
}

new ConfigService('0.1.0'); // eslint-disable-line no-new
init();
