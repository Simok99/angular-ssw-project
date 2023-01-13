import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {}
  teatri: Array<Teatro> = [{ id: 1, spettacolo: 'Shakespeare' }];
  showT: boolean = true;
  selezione: number;
  showFormName: boolean = false;
  selectT(id: number) {
    this.selezione = id;
  }
  requestAccess(key: string) {
    //TODO match con key generata tramite new del service kvaas
    this.showT = false;
    this.selezione = undefined;
    this.showFormName = true;
  }
}

export class Teatro {
  id: number;
  spettacolo: string;
}
