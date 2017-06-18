import { m } from '../../vendor/js/mithril.js';

export class ActionBarComponent {

  constructor(vnode) {
    this.onbeforeupdate(vnode);
  }

  onbeforeupdate(vnode) {
    this.actions = vnode.attrs.actions || [];
    this.title = vnode.attrs.title;
  }

  action(data) {
    const btnClass = (data.main) ? 'btn-primary' : 'btn-link';
    return m(`button.btn.${btnClass}.action`, {
      onclick: data.callback
    }, [
      m(`i.icon.icon-${data.icon}`),
      ` ${data.label}`
    ]);
  }

  view() {
    return m('.actionbar.container', 
      m('.columns', [
        m('h1.col-xs-12.col-8', this.title),
        m('.btn-group.btn-group-block.col-xs-12.col-4.actions', this.actions.map(this.action))
      ])
    );
    
  }

}
