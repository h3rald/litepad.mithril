import { ActionBarComponent } from './actionbar.cmp.js';
import { CodeMirror } from '../../vendor/js/markdown.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { ModalComponent } from './modal.cmp.js';
import { NavBarComponent } from './navbar.cmp.js';
import { m } from '../../vendor/js/mithril.js';

export class NewNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.note = {title: '', body: ''};
    this.editor = null;
    this.error = false;
    this.actions = [
      {
        label: 'Cancel',
        main: false,
        icon: 'cancel',
        callback: () => {
          m.route.set(`/home`);
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
            this.store.create(this.note).then((data) => {
              m.route.set(`/view/${data.id}`);
            }).catch((e) => {
              console.warn(e); // eslint-disable-line no-console
            });
          }
        }
      }
    ];
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
        autofocus: false
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
          placeholder: 'Enter text here...',
          oncreate: () => { this.highlight(); },
        }, this.note.body)
      ]),
      this.modal(),
      m(FooterComponent)
    ]);
  }
}
