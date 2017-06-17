import { ActionBarComponent } from './actionbar.cmp.js';
import { CodeMirror } from '../../vendor/js/markdown.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { ModalComponent } from './modal.cmp.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class EditNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.editor = null;
    this.error = false;
    this.load();
    this.actions = [
      {
        label: 'Cancel',
        main: false,
        icon: 'cancel',
        callback: () => {
          m.route.set(`/view/${this.id}`);
        }
      },
      {
        label: 'Save',
        main: true,
        icon: 'tick',
        callback: () => {
          this.note.body = this.editor.getValue();
          if (this.note.body === '' || this.note.title === '') {
            this.error = true;
            m.redraw();
          } else {
            this.store.save(this.note).then(() => {
              this.notification.success('Note modified successfully.');
              m.route.set(`/view/${this.id}`);
            }).catch((e) => {
              this.notification.error(JSON.parse(e.message).error);
            });
          }
        }
      }
    ];
  }

  load(){
    this.store.get(this.id).then((note) => {
      this.note = new Note(note);
    });
  }

  setTitle(value) {
    this.note.title = value;
  }

  highlight() {
    const element = document.getElementById("note-body");
    if (element) {
      this.editor = CodeMirror.fromTextArea(element, {
        mode: 'markdown', 
        tabSize: 2, 
        theme: 'mdn-like',
        lineWrapping: true,
        lineNumbers: true,
        autofocus: true
      });
    }
  }

   modal() {
    if (this.error) {
      return m(ModalComponent, {
        title: 'Unable to save note',
        message: 'Title and body text cannot be empty.',
        buttons: [
          {
            title: 'OK',
            icon: 'tick',
            type: 'primary',
            callback: () => {
              this.error = false;
              m.redraw();
            }
          }
        ]
      });
    }
    return '';
  }

  view(){
    const title = m('input#note-title', {
      placeholder: 'Enter title here...',
      oninput: m.withAttr('value', this.setTitle, this),
      value: this.note.title,
      autofocus: true
    });
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: title, actions: this.actions}),
        m('textarea#note-body.content', {
          onupdate: () => { this.highlight(); },
        }, this.note.body)
      ]),
      this.modal(),
      m(FooterComponent)
    ]);
  }
}
