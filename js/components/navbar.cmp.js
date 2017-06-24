import { NotificationService } from '../services/notification.svc.js';
import { ShortcutService } from '../services/shortcut.svc.js';
import { m } from '../../vendor/js/mithril.js';

let searching = false;
export class NavBarComponent {

  constructor(){
    this.notification = new NotificationService();
    this.shortcut = new ShortcutService();
    this.searching = false;
    this.query = '';
    this.defineShortcuts();
  }

  defineShortcuts() {
    this.shortcut.add('ctrl-f', (e) => this.enableSearch(e));
    this.shortcut.add('esc', (e) => this.disableSearch(e));
    this.shortcut.add('ctrl-h', (e) => this.goHome(e));
    this.shortcut.add('ctrl-a', (e) => this.addNote(e));
    this.shortcut.add('enter', {includeElements: 'search-input'}, (e) => this.doSearch(e));
    this.shortcut.add('ctrl-k', {includeElements: 'search-input'}, (e) => this.clearLine(e));
  }

  goHome() {
    searching = false;
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
    searching = true;
    m.redraw();
    document.getElementById('search-input').focus();
    return false;
  }

  disableSearch() {
    this.query = '';
    searching = false;
    m.redraw();
    return false;
  }

  toggleSearch(){
    this.query = '';
    searching = !searching;
    m.redraw();
  }

  search() {
    searching = false;
    const q = this.query;
    this.query = '';
    m.route.set('/search/:query', {query: q}, {state: {key: Date.now()}});
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
    const searchLink = m('span.btn.btn-primary.input-group-btn', {
      onclick: () => { this.search(); }
    }, [m('i.icon.icon-search')]);
    return m('.input-group.searchbar', [
      backLink,
      textbox,
      searchLink
    ]);
  }
  
  view(){
    const contents = (searching) ? this.buildSearchBar() : this.buildStatusBar();
    return m('header.navbar', [
      this.notification.display(),
      contents
    ]);
  }
}
