import { ActionBarComponent } from './actionbar.cmp.js';
import { CodeMirror } from '../../vendor/js/markdown.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class EditNoteComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.id = m.route.param('id');
    this.note = {body: ""};
    this.editor = null;
    this.load();
    this.defineActions();
    this.defineShortcuts();
  }

  defineActions(){
    this.actions = [
      {
        label: 'Cancel',
        main: false,
        icon: 'stop',
        callback: () => {
          m.route.set(`/view/${this.id}`);
        }
      },
    {
      label: 'Save',
      main: true,
      icon: 'check',
      callback: () => {
        this.save();
      }
    }];
  }

  defineShortcuts(){
    this.shortcut.add('ctrl-s', {local: true}, () => {
      this.save('edit');
      return false;
    });
    this.shortcut.add('ctrl-o', {local: true}, () => {
      this.save();
      return false;
    });
  }

  save(state='view'){
    this.note.body = this.editor.getValue();
    if (this.note.body === '' || this.note.title === '') {
      this.notification.error('Title and body text cannot be empty.');
    } else {
      this.store.save(this.note).then(() => {
        this.notification.success('Note modified successfully.');
        m.route.set(`/${state}/${this.id}`);
      }).catch(this.notification.error);
    }
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
    const element = document.getElementById('note-body');
    const editors = document.getElementsByClassName('CodeMirror');
    if (element && editors.length === 0) {
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
          onupdate: () => { this.highlight(); },
        }, this.note.body)
      ]),
      m(FooterComponent)
    ]);
  }
}
