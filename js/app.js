import { ConfigService } from './services/config.svc.js';
import { EditNoteComponent } from './components/editnote.cmp.js';
import { HomeComponent } from './components/home.cmp.js';
import { ViewNoteComponent } from './components/viewnote.cmp.js';
import { m } from '../vendor/js/mithril.js';

function init() {
  m.route(document.body, '/home', {
    '/home': HomeComponent,
    '/view/:id': ViewNoteComponent,
    '/edit/:id': EditNoteComponent
  });
}

new ConfigService('0.1.0'); // eslint-disable-line no-new
init();
