import { ActionBarComponent } from './actionbar.cmp.js';
import { CodeMirror } from '../../vendor/js/markdown.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class NewNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.note = {title: '', body: ''};
    this.editor = null;
    this.defineActions();
    this.defineShortcuts();
  }

  save(state='view'){
    let note = null;
    this.note.body = this.editor.getValue();
    if (this.note.body === '' || this.note.title === '') {
      this.notification.error('Title and body text cannot be empty.');
    } else {
      this.store.create(this.note).then((data) => {
        note = new Note(data);
        return this.store.save(note);
      }).then(() => {
        this.notification.success(`Note '${note.title}' created successfully.`);
        m.route.set(`/${state}/${note.id}`);
      }).catch(this.notification.error);
    }
  }

  defineShortcuts(){
    this.shortcut.add('ctrl-o', {local: true}, () => {
      this.save();
      return false;
    });
  }

  defineActions(){
    this.actions = [
      {
        label: 'Cancel',
        main: false,
        icon: 'stop',
        callback: () => {
          m.route.set(`/home`);
        }
      },
      {
        label: 'Save',
        main: true,
        icon: 'check',
        callback: () => {
          this.save();
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

  view(){
    const title = m('input#note-title', {
      placeholder: 'Enter title here...',
      oninput: m.withAttr('value', this.setTitle, this),
      value: this.note.title,
      autofocus: true
    });
    return m('article.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: title, actions: this.actions}),
        m('textarea#note-body.content', {
          placeholder: 'Enter text here...',
          oncreate: () => { this.highlight(); },
        }, this.note.body)
      ]),
      m(FooterComponent)
    ]);
  }
}
