import { m } from '../../vendor/js/mithril.js';

let instance = null;
let displaying = false;
export class NotificationService {

  constructor(){
    if (!instance) {
      instance = this;
      this.notification = {};
      this.storage = window.sessionStorage;
    }
    instance.display();
    return instance;
  }

  display(){
    instance.get();
    if (instance.notification && instance.notification.type && !displaying) {
      displaying = true;
      setTimeout(() => {
        const el = document.getElementById('notification');
        if (el) {
          el.classList.remove('show');
        }
        instance.clear();
      }, instance.notification.duration);
      return m(`#notification.toast.toast-${instance.notification.type}.show`, instance.notification.message);
    }
    return '';
  }

  get(){
    instance.notification = JSON.parse(instance.storage.getItem('notification')) || {};
    return instance.notification;
  }
  
  set(data){
    instance.storage.setItem('notification', JSON.stringify(data));
  }

  error(message) {
    setTimeout(() => {
      instance.set({type: 'error', message: message, duration: 2000});
      m.redraw();
    }, 200);
  }

  success(message) {
    setTimeout(() => {
      instance.set({type: 'success', message: message, duration: 2000});
      m.redraw();
    }, 200);
  }

  clear(){
    displaying = false;
    instance.storage.setItem('notification', JSON.stringify({}));
  }
}
