import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {}
  private teatro1: Teatro = new Teatro(1, 'Shakespeare', 7, 4, 10, 6);
  private teatri: Array<Teatro> = [this.teatro1];
  showT: boolean = true;
  private selezione: number;
  private teatroSel: Teatro;
  showFormName: boolean = false;
  private formName: string;
  showPrenotazioni: boolean = false;

  selectT(id: number) {
    for (let teatro of this.teatri) {
      if (teatro.getId() === id) {
        this.selezione = id;
        this.teatroSel = teatro;
        return;
      }
    }
    alert('Errore: teatro non trovato, riprovare');
  }

  requestAccess(key: string) {
    //TODO match con key generata tramite new del service kvaas
    this.showT = false;
    this.selezione = undefined;
    this.showFormName = true;
  }

  receiveName($event: string) {
    this.formName = $event;
    //Teatro selezionato e nome impostato, posso mostrare il component prenotazione
    this.showPrenotazioni = true;
  }

  getTeatri() {
    return this.teatri;
  }
  getSelection() {
    return this.selezione;
  }
  getFormName() {
    return this.formName;
  }
  getTeatroSel() {
    return this.teatroSel;
  }
}

export class Teatro {
  private id: number;
  private spettacolo: string;
  private filePlatea: number;
  private filePalchi: number;
  private postiPlatea: number;
  private postiPalchi: number;

  private platea: Array<string>[];
  private palchi: Array<string>[];

  constructor(
    id: number,
    spettacolo: string,
    filePlatea: number,
    filePalchi: number,
    postiPlatea: number,
    postiPalchi: number
  ) {
    this.id = id;
    this.spettacolo = spettacolo;
    this.filePlatea = filePlatea;
    this.filePalchi = filePalchi;
    this.postiPlatea = postiPlatea;
    this.postiPalchi = postiPalchi;

    this.buildPlatea();
    this.buildPalchi();
  }

  private buildPlatea() {
    this.platea = Array.from({ length: this.filePlatea }, () => '').map(() =>
      Array.from({ length: this.postiPlatea }, () => '')
    );
  }

  private buildPalchi() {
    this.palchi = Array.from({ length: this.filePalchi }, () => '').map(() =>
      Array.from({ length: this.postiPalchi }, () => '')
    );
  }

  public getId() {
    return this.id;
  }
  public getSpettacolo() {
    return this.spettacolo;
  }
  public getFilePlatea() {
    return this.filePlatea;
  }
  public getFilePalchi() {
    return this.filePalchi;
  }
  public getPostiPlatea() {
    return this.postiPlatea;
  }
  public getPostiPalchi() {
    return this.postiPalchi;
  }

  public getPlatea() {
    return this.platea;
  }

  public getPalchi() {
    return this.palchi;
  }

  //TODO Aggiungere setter per associazione posto-nome prenotazione

  //TODO Aggiungere setter per implementazione bottone aggiungi teatro
}
