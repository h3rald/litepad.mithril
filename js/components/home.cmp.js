import { ActionBarComponent } from './actionbar.cmp.js';
import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class HomeComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.notes = [];
    this.loading = true;
    this.error = false;
    this.empty = false;
    this.selected = null;
    this.load();
    this.defineShortcuts();
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

  defineShortcuts() {
    this.shortcut.add('up', {matchRoute: /^\/home/}, () => this.selectPrevious());
    this.shortcut.add('down', {matchRoute: /^\/home/}, () => this.selectNext());
    this.shortcut.add('space', {matchRoute: /^\/home/}, () => {
      if (this.selected) {
        m.route.set(`/view/${this.selected.dataset.noteId}`);
      }
      return false;
    });
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

  select(tile) {
    this.deselect();
    tile.classList.add('selected');
    tile.scrollIntoView();
    this.selected = tile;
  }

  deselect() {
    const tiles = Array.from(document.getElementsByClassName('tile'));
    tiles.forEach((t) => t.classList.remove('selected'));
    this.selected = null;
  }

  selectNext() {
    const tiles = Array.from(document.getElementsByClassName('tile'));
    if (!this.selected) {
      if (tiles.length > 0) {
        this.select(tiles[0]);
      }     
    } else {
      const index = tiles.indexOf(this.selected);
      if (index < tiles.length-1) {
        this.select(tiles[index+1]);
      }
    }
  }

  selectPrevious() {
    if (this.selected) {
      const tiles = Array.from(document.getElementsByClassName('tile'));
      const index = tiles.indexOf(this.selected);
      if (index > 0) {
        this.select(tiles[index-1]);
      }
    }
  }

  tile(note) {
    const modified = note.modified || note.created;
    const subtitle = `${note.words()} &bull; ${modified}`;
    return m(`.tile`, {
      onclick: () => { m.route.set(`/view/${note.id}`); },
      'data-note-id': note.id 
    },
    [
      m('.tile-icon', m('i.icon.icon-link.centered')),
      m('.tile-content', [
        m('.tile-title', note.title),
        m('.tile-subtitle', m.trust(subtitle))
      ]),
    ]);
  }

  content() {
    if (this.loading) {
      return [m('.loading'), m('.loading-message', 'Loading...')];
    }
    if (!this.empty) {
      return this.notes.map(this.tile);
    }
    if (this.error) {
      return m('.toast.toast-error', 'An error occurred when loading notes.');
    }
    return m('.empty', [
      m('.empty-icon', m('i.icon.icon-cross')),
      m('h4.empty-title', "There are no notes."),
      m('p.empty-subtitle', 'Click the button to create a new note.'),
      m('.empty-action', m('button.btn.btn-primary', {
        onclick: () => {
          m.route.set(`/new`);
        }
      }, [m('i.icon.icon-plus'), ' New Note']))
    ]);
  }

  view(){
    const actions = (this.empty) ? [] : this.actions;
    const subtitle = (this.notes.length > 0) ? `Total: ${this.notes.length}` : null;
    return m('article.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m(ActionBarComponent, {title: 'Notes', subtitle: subtitle, actions: actions}),
        m('.main-content', this.content())
      ]),
      m(FooterComponent)
    ]);
  }
}
