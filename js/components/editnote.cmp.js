import { ActionBarComponent } from './actionbar.cmp.js';
import { CodeMirror } from '../../vendor/js/markdown.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { m } from '../../vendor/js/mithril.js';

export class EditNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.editor = null;
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
        icon: 'save',
        callback: () => {
          this.note.body = this.editor.getValue();
          this.store.save(this.note).then(() => {
            m.route.set(`/view/${this.id}`);
          }).catch((e) => {
            console.warn(e); // eslint-disable-line no-console
          });
        }
      }
    ];
  }

  load(){
    this.store.get(this.id).then((note) => {
      this.note = new Note(note);
    });
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

  view(){
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: this.note.title, actions: this.actions}),
        m('textarea#note-body.content', {
          onupdate: () => { this.highlight(); },
        }, this.note.body)
      ]),
      m(FooterComponent)
    ]);
  }
}
