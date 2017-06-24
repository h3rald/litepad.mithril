import { keymage } from '../../vendor/js/keymage.js';
import { m } from '../../vendor/js/mithril.js';

let instance = null;

class Shortcut {
  constructor(k, options, callback) {
    this.key = k;
    this.matchRoute = options.matchRoute;
    this.includeElements = options.includeElements || [];
    this.excludeTags = options.excludeTags || [];
    this.callback = callback;
    this.unbind = keymage(k, (event) => {
      return this.exec(event);
    });
  }

  equals(s) {
    return this.key === s.key && this.matchRoute === s.matchRoute && this.includeElements === s.includeElements;
  }

  exec(event) {
    const routeIncluded = !this.matchRoute || m.route.get().match(this.matchRoute);
    const elementIncluded = this.includeElements.length === 0 || this.includeElements.includes(event.srcElement.id);
    const tagNotExcluded = this.excludeTags.length === 0 || !this.excludeTags.includes(event.srcElement.tagName);
    if (routeIncluded && elementIncluded && tagNotExcluded) {
      return this.callback(event);
    }
    return true;
  }
}

export class ShortcutService {

  constructor(){
    if (!instance) {
      this.shortcuts = [];
      instance = this;
    }
    return instance;
  }

  add(k, options, callback){
    if (arguments.length < 3) {
      callback = options;
      options = {};
    }
    const shortcut = new Shortcut(k, options, callback);
    this.remove(shortcut);
    this.shortcuts.push(shortcut);
  }

  remove(s1){
    const shortcuts = [];
    this.shortcuts.forEach((s0) => {
      if (s1.equals(s0)){
        s0.unbind();
      } else {
        shortcuts.push(s0);
      }
    });
    this.shortcuts = shortcuts;
  }
}
