import { m } from '../../vendor/js/mithril.js';
import { ConfigService } from './config.svc.js';

let instance;
export class LiteStoreService {

  constructor(){
    if (!instance) {
      this.config = new ConfigService();
      instance = this;
    }
    return instance;
  }

  get(id) {
    return m.request({
      method: 'GET',
      url: `${this.config.settings.api}/docs/${this.config.settings.prefix}${id}?raw=true`
    });
  }

  getAll() {
    return m.request({
      method: 'GET',
      url: `${this.config.settings.api}/docs/${this.config.settings.prefix}?sort=-modified,-created`
    });
  }

  create(note){
    return m.request({
      method: 'POST',
      url: `${this.config.settings.api}/docs/${this.config.settings.prefix}`,
      data: note
    });
  }
  
  save(note){
    return m.request({
      method: 'PUT',
      url: `${this.config.settings.api}/docs/${this.config.settings.prefix}${note.id}`,
      data: note
    });
  }

  delete(note){
    return m.request({
      method: 'DELETE',
      url: `${this.config.settings.api}/docs/litepad/notes/${note.id}`
    });
  }

  search(query){
    return m.request({
      method: 'GET',
      url: `${this.config.settings.api}/docs/litepad/notes/?search=${query}`
    })
  }
 
}