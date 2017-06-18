import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { ModalComponent } from './modal.cmp.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { m } from '../../vendor/js/mithril.js';
import { marked } from '../../vendor/js/marked.js';

export class ViewNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.message = {};
    this.delete = false;
    this.load();
    if (m.route.param('q')) {
      this.back = `/search/${m.route.param('q')}`;
    } else {
      this.back = '/home';
    }
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
          this.delete = true;
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

  modal() {
    if (this.delete) {
      return m(ModalComponent, {
        title: 'Delete Note',
        message: 'Do you want to really delete this note?',
        buttons: [
          {
            title: 'Cancel',
            icon: 'stop',
            type: 'link',
            callback: () => {
              this.delete = false;
              m.redraw();
            }
          },
          {
            title: 'Delete',
            icon: 'delete',
            type: 'primary',
            callback: () => {
              this.store.delete(this.note).then(() => {
                this.notification.success('Note deleted successfully.');
                m.route.set('/home');
              }).catch((e) => {
                this.delete = false;
                this.notification.error(e);
              });
            }
          }
        ]
      });
    }
    return '';
  }

  view(){
    return m('article.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: this.note.title, actions: this.actions}),
        m('.main-content.note', m.trust(marked(this.note.body)))
      ]),
      this.modal(),
      m(FooterComponent)
    ]);
  }
}
