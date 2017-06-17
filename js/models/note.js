import { ConfigService } from '../services/config.svc.js';

export class Note {

  constructor(note) {
    this.config = new ConfigService();
    this.id = note.id.replace(new RegExp(`^${this.config.settings.prefix}`), '');
    const split = note.data.split(/\n\n/);
    this.title = split.shift();
    this.body = split.join('\n\n');
  }

  words() {
    return `${this.body.split(/\s/m).length} words`;
  }

}
