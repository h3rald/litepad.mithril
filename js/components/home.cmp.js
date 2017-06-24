import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NoteListComponent } from './notelist.cmp.js';
import { NotificationService } from '../services/notification.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class HomeComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.notes = null;
    this.error = false;
    this.load();
    this.actions = [
      {
        label: 'Add',
        main: true,
        icon: 'plus',
        callback: () => {
          m.route.set(`/new`);
        }
      }
    ];
  }

  load(){
    this.store.getAll().then((notes) => {
      this.error = false;
      this.loading = false;
      this.empty = false;
      this.notes = notes.results.map((note) => new Note(note));
    }).catch((e) => {
      this.loading = false;
      const message = this.notification.error(e);
      if (message === 'No documents found.') {
        this.empty = true;
      } else {
        this.error = true;
      }
    });
  }

  view(){
    const actions = (this.empty) ? [] : this.actions;
    const subtitle = (this.notes && this.notes.length > 0) ? `Total: ${this.notes.length}` : null;
    return m('article.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: 'Notes', subtitle: subtitle, actions: actions}),
        m('.main-content', m(NoteListComponent, {notes: this.notes}))
      ]),
      m(FooterComponent)
    ]);
  }
}
