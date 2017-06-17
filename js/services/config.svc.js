let instance;

export class ConfigService {

  constructor(version){
    if (!instance) {
      this.version = version;
      this.defaults = {
        api: 'http://localhost:9500',
        prefix: 'litepad/notes/'
      };
      this.storage = window.localStorage;
      instance = this;
    }
    instance.settings = instance.load();
    return instance;
  }
  
  load(){
    instance.settings = JSON.parse(instance.storage.getItem('config')) || instance.defaults;
    return instance.settings;
  }
  
  save(obj){
    const data = Object.assign(instance.settings, obj);
    instance.storage.setItem('config', JSON.stringify(data));
  }
}
