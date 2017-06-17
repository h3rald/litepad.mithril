import { m } from '../../vendor/js/mithril.js';

let searching = false;
export class NavBarComponent {

  constructor(){
    this.searching = false;
    this.query = '';
  }
  
  handleKeyPress(event){
    if (event.charCode === 13){
      this.search();
    }
  }

  clearSearch(){
    this.query = '';
  }

  search() {
    searching = false;
    const { query } = this;
    this.clearSearch();
    m.route.set('/search/:query', {query: query});
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
        this.clearSearch(); 
        this.toggleSearch();
      }
    }, [m('i.icon.icon-back')]);
    const textbox = m('input.search.form-input', {
      placeholder: 'Search...',
      autofocus: true,
      value: this.query,
      oninput: m.withAttr('value', this.setQuery, this),
      onkeypress: (e) => { this.handleKeyPress(e); }
    });
    const searchLink = m('span.btn.btn-primary.input-group-btn', {
      onclick: this.search
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
