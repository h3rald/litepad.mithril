import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { ModalComponent } from './modal.cmp.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';
import { marked } from '../../vendor/js/marked.js';

export class ViewNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.q = m.route.param('q');
    this.back = this.q ? `/search/${this.q}` : '/home';
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.message = {};
    this.deleting = false;
    this.load();
    this.defineShortcuts();
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
    this.defineActions();
  }

  defineActions(){
    this.actions = [
      {
        label: 'Back',
        main: false,
        icon: 'back',
        callback: () => {
          m.route.set(this.back);
        }
      },
      {
        label: 'Delete',
        main: false,
        icon: 'delete',
        callback: () => {
          this.deleting = true;
          m.redraw();
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

  defineShortcuts(){
    this.shortcut.add('left', {local: true}, () => {
      m.route.set(this.back);
      return false;
    });
    this.shortcut.add('ctrl-e', {local: true}, () => {
      m.route.set(`/edit/${m.route.param('id')}`);
      return false;
    });
    this.shortcut.add('ctrl-d', {local: true}, () => {
      this.deleting = true;
      m.redraw();
      return false;
    });
    this.shortcut.add('esc', {local: true}, () => {
      if (this.deleting) {
        this.deleting = false;
        m.redraw();
      }
      return false;
    });
    this.shortcut.add('enter', {local: true}, () => {
      if (this.deleting) {
        this.delete();
      }
      return false;
    });
  }

  load(){
    this.store.get(this.id).then((note) => {
      this.note = new Note(note);
    });
  }

  delete(){
    this.store.delete(this.note).then(() => {
      this.notification.success('Note deleted successfully.');
      m.route.set('/home');
    }).catch((e) => {
      this.deleting = false;
      this.notification.error(e);
    });
  }

  modal() {
    if (this.deleting) {
      return m(ModalComponent, {
        title: 'Delete Note',
        message: 'Do you want to really delete this note?',
        buttons: [
          {
            title: 'Cancel',
            icon: 'stop',
            type: 'link',
            callback: () => {
              this.deleting = false;
            }
          },
          {
            title: 'Delete',
            icon: 'delete',
            type: 'primary',
            callback: () => {
              this.delete();
            }
          }
        ]
      });
    }
    return '';
  }

  view(){
    if (!this.note.created) {
      return '';
    }
    const modified = this.note.modified || this.note.created;
    const subtitle = `${this.note.words()} &bull; ${modified}`;
    return m('article.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: this.note.title, subtitle: m.trust(subtitle), actions: this.actions}),
        m('.main-content.note', m.trust(marked(this.note.body)))
      ]),
      this.modal(),
      m(FooterComponent)
    ]);
  }
}
