import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class SearchComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.notes = [];
    this.query = m.route.param('query');
    this.loading = true;
    this.error = false;
    this.empty = false;
    this.load();
    this.actions = [
      {
        label: 'Home',
        main: true,
        icon: 'back',
        callback: () => {
          m.route.set(`/home`);
        }
      }
    ];
  }

  load(){
    this.store.search(this.query).then((notes) => {
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

  card(note) {
    const modified = note.modified || note.created;
    const subtitle = `${note.words()} &bull; ${modified}`;
    return m('.card', [
      m('.card-header', [
        m('.card-actions', [
          m('button.btn.btn-link', {
            onclick: () => { m.route.set(`/edit/${note.id}/q/${this.query}`); }
          }, [
            m('i.icon.icon-edit'),
            ' Edit'
          ]),
          m('button.btn.btn-link', {
            onclick: () => { m.route.set(`/view/${note.id}/q/${this.query}`); }
          }, [
            m('i.icon.icon-share'),
            ' View'
          ]),
        ]),
        m('.card-title', note.title),
        m('.card-subtitle', m.trust(subtitle))
      ]),
      m('.card-body', m.trust(note.highlight))
    ]);
  }

  content() {
    if (this.loading) {
      return [m('.loading'), m('.loading-message', 'Loading...')];
    }
    if (!this.empty) {
      return this.notes.map((n) => { 
        return this.card(n); 
      });
    }
    if (this.error) {
      return m('.toast.toast-error', 'An error occurred when loading notes.');
    }
    return m('.empty', [
      m('.empty-icon', m('i.icon.icon-cross')),
      m('h4.empty-title', "No notes found."),
      m('p.empty-subtitle', 'There are no notes matching your search.'),
      m('.empty-action', m('button.btn.btn-primary', {
        onclick: () => {
          m.route.set(`/home`);
        }
      }, [m('i.icon.icon-back'), ' Back to Home']))
    ]);
  }

  view(){
    const actions = (this.empty) ? [] : this.actions;
    const subtitle = `Total: ${this.notes.length}`;
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: ['Search: ', m('em', this.query)], subtitle: subtitle, actions: actions}),
        m('.main-content', this.content())
      ]),
      m(FooterComponent)
    ]);
  }
}
