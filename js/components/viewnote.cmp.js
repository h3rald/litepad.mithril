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
        label: 'Delete',
        main: false,
        icon: 'trash',
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
            icon: 'cancel',
            type: 'link',
            callback: () => {
              this.delete = false;
              m.redraw();
            }
          },
          {
            title: 'Delete',
            icon: 'trash',
            type: 'primary',
            callback: () => {
              this.store.delete(this.note).then(() => {
                this.notification.success('Note deleted successfully.');
                m.route.set('/home');
              }).catch((e) => {
                this.delete = false;
                this.notification.error(JSON.parse(e.message).error);
              });
            }
          }
        ]
      });
    }
    return '';
  }

  view(){
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: this.note.title, actions: this.actions}),
        m('.main-content', m.trust(marked(this.note.body)))
      ]),
      this.modal(),
      m(FooterComponent)
    ]);
  }
}
