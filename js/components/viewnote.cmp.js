import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { m } from '../../vendor/js/mithril.js';
import { marked } from '../../vendor/js/marked.js';

export class ViewNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.load();
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: true
    });
    this.actions = [
      {
        label: 'Back',
        main: false,
        icon: 'arrow-left',
        callback: () => {
          m.route.set(`/home/`);
        }
      },
      {
        label: 'Edit',
        main: true,
        icon: 'edit',
        callback: () => {
          m.route.set(`/edit/${this.id}`);
        }
      }
    ];
  }

  load(){
    this.store.get(this.id).then((note) => {
      this.note = new Note(note);
    });
  }

  view(){
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: this.note.title, actions: this.actions}),
        m('.main-content', m.trust(marked(this.note.body)))
      ]),
      m(FooterComponent)
    ]);
  }
}
