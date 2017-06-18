import { m } from '../../vendor/js/mithril.js';

let searching = false;
export class NavBarComponent {

  constructor(){
    this.searching = false;
    this.query = '';
    window.onkeypress = (e) => { 
      this.handleKeyPress(e); 
    };
  }

  handleKeyPress(e) {
    if (e.code === 'KeyF' && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      this.toggleSearch();
      m.redraw();
    }
    else if (e.code === 'KeyH' && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      searching = false;
      m.redraw();
      m.route.set('/home', null, {state: {key: Date.now()}});
    }
    if (e.code === 'KeyN' && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      m.route.set('/new', null, {state: {key: Date.now()}});
    }
  }
  
  handleSearchKeyPress(e){
    if (e.charCode === 13){
      e.preventDefault();
      this.search();
    }
    else if (e.code === 'KeyK' && (e.altKey || e.crlKey)) {
      e.preventDefault();
      this.query = '';
      m.redraw();
    }
  }

  search() {
    searching = false;
    const q = this.query;
    this.query = '';
    m.route.set('/search/:query', {query: q});
  }
  
  toggleSearch(){
    searching = !searching;
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
    const textbox = m('input.search.form-input', {
      placeholder: 'Search...',
      autofocus: true,
      value: this.query,
      oninput: m.withAttr('value', this.setQuery, this),
      onkeypress: (e) => { this.handleSearchKeyPress(e); }
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
    return m('header.navbar', contents);
  }
}
