import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {}
  teatri: Array<Teatro> = [{ id: 1, spettacolo: 'Shakespeare' }];
  selezione: number;
  selectT(id: number) {
    this.selezione = id;
  }
  requestAccess(key: string) {
    //TODO match con key generata tramite new del service kvaas
  }
}

export class Teatro {
  id: number;
  spettacolo: string;
}
