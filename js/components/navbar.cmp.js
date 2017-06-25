import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';

export class NavBarComponent {

  constructor(){
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.query = m.route.param('q');
    if (this.query) {
      this.searching = true;
    } else {
      this.searching = false;
    }
    this.defineShortcuts();
  }

  defineShortcuts() {
    this.shortcut.add('ctrl-f', (e) => this.enableSearch(e));
    this.shortcut.add('ctrl-h', (e) => this.goHome(e));
    this.shortcut.add('ctrl-a', (e) => this.addNote(e));
  }

  goHome() {
    this.searching = false;
    this.query = '';
    m.redraw();
    m.route.set('/home', null, {state: {key: Date.now()}});
    return false;
  }

  addNote() {
    m.route.set('/new', null, {state: {key: Date.now()}});
    return false;
  }

  doSearch() {
    this.search();
  }

  clearLine() {
    this.query = '';
    m.redraw();
    return false;
  }

  enableSearch() {
    this.query = '';
    this.searching = true;
    m.redraw();
    document.getElementById('search-input').focus();
    return false;
  }

  disableSearch() {
    this.query = '';
    this.searching = false;
    m.redraw();
  }

  toggleSearch(){
    this.query = '';
    this.searching = !this.searching;
    m.redraw();
  }

  search() {
    const q = this.query;
    m.route.set('/search/:q', {q: q}, {state: {key: Date.now()}});
  }
  
  setQuery(text){
    this.query = text;
  }
  
  buildStatusBar(){
    const logo = m('section.navbar-section', [
      m(`span.logo.btn.btn-link`, {
        onclick: () => { m.route.set('/home/'); }
      }, 'LitePad')
    ]);
    const searchLink = m('section.navbar-section', [
      m('span.btn.btn-link', {
        onclick: () => { 
          this.toggleSearch(); 
        }
      }, [m('i.icon.icon-search')])
    ]);
    const result = [logo, m('section.navbar-section')];
    result.push(searchLink);
    return result;
  }
  
  buildSearchBar(){
    const backLink = m('span.btn.btn-link.input-group-btn', {
      onclick: () => { 
        this.query = ''; 
        this.toggleSearch();
      }
    }, [m('i.icon.icon-cross')]);
    const textbox = m('input.search.form-input.#search-input', {
      placeholder: 'Search...',
      autofocus: true,
      value: this.query,
      oninput: m.withAttr('value', this.setQuery, this)
    });
    const searchLink = m('button[type=submit].btn.btn-primary.input-group-btn', {
      onclick: () => { this.search(); }
    }, [m('i.icon.icon-search')]);
    return m('form.input-group.searchbar', {
      onsubmit: () => this.search()
    }, [
      backLink,
      textbox,
      searchLink
    ]);
  }
  
  view(){
    const contents = (this.searching) ? this.buildSearchBar() : this.buildStatusBar();
    return m('header.navbar', [
      this.notification.display(),
      contents
    ]);
  }
}
