import { FooterComponent } from './footer.cmp.js';
import { LiteStoreService } from '../services/litestore.svc.js';
import { NavBarComponent } from './navbar.cmp.js';
import { Note } from '../models/note.js';
import { m } from '../../vendor/js/mithril.js';

export class HomeComponent {

  constructor(){
    this.store = new LiteStoreService();
    this.notes = [];
    this.load();
  }

  load(){
    this.store.getAll().then((notes) => {
      this.notes = notes.results.map((note) => new Note(note));
    });
  }

  tile(note) {
    return m('.tile.tile-centered', {
      onclick: () => { m.route.set(`/view/${note.id}`); }
    },
    [
      m('.tile-icon', m('i.typcn.typcn-document.centered')),
      m('.tile-content', [
        m('.tile-title', note.title),
        m('.tile-subtitle', note.words())
      ]),
    ]);
  }

  view(){
    return m('article.notes.columns', [
      m(NavBarComponent),
      m('main.column.col-12', [
        m('h1', 'Notes'),
        m('.content', this.notes.map(this.tile))
      ]),
      m(FooterComponent)
    ]);
  }
}
