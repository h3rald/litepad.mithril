import { m } from '../../vendor/js/mithril.js';

export class ModalComponent {

  constructor(vnode) {
    this.active = '.active';
    this.title = vnode.attrs.title;
    this.message = vnode.attrs.message;
    this.buttons = vnode.attrs.buttons;
  }

  close() {
    this.active = '';
    m.redraw();
  }

  footer() {
    return this.buttons.map((btn) => {
      return m(`button.btn.btn-${btn.type}`, {
        onclick: () => { 
          if (btn.callback) {
            btn.callback();
          }
          this.close;
         } 
      }, [
        m(`i.icon.icon-${btn.icon}`),
        btn.title
      ]);
    });
  }

  view() {
    return m(`.modal${this.active}.modal-sm`, [
      m('.modal-overlay'),
      m('.modal-container', [
        m('.modal-header', [
          m('button.btn.btn-clear.float-right', {
            onclick: () => { this.close(); }
          }),
          m('.modal-title', this.title)
        ]),
        m('.modal-body', [
          m('.content', m('p', this.message))
        ]),
        m('.modal-footer', this.footer())
      ])
    ]);
  }
}
