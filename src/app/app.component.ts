import { Component } from '@angular/core';
import { KvaasService } from './kvaas.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private kvaas: KvaasService) {}
  private teatro1: Teatro = new Teatro(1, 'Shakespeare', 7, 4, 10, 6);
  private teatri: Array<Teatro> = [this.teatro1];
  showT: boolean = true;
  private selezione: number;
  private teatroSel: Teatro;
  private userInputKey: string;
  showMessagePar: boolean = false;
  messagePar: string = '';
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
    if (this.selezione === 1) {
      //Teatro default selezionato
      if (!this.kvaas.matchDefaultKey(key)) {
        //Chiave inserita errata
        alert('Chiave non corretta per il teatro ' + this.selezione);
        return;
      }
    }
    //Chiave corretta
    this.userInputKey = key;
    this.showT = false;
    this.selezione = undefined;
    this.showFormName = true;
  }

  private fetchPrenotazioni() {
    //Effettua un refresh dei dati delle prenotazioni dal service kvaas
    this.kvaas.getData(this.userInputKey).subscribe({
      next: (data: any) => this.teatroSel.updateTheater(data),
      error: (e) => {
        this.messagePar =
          'Impossibile caricare le prenotazioni dal server. Errore: ' + e;
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
        }, 3000);
        return false;
      },
    });
    return true;
  }

  private requestPrenotazione(posti: string, name: string) {
    //Controlla che i posti selezionati siano disponibili
    if (!this.fetchPrenotazioni()) return false;
  }

  private setPrenotazioni() {
    //Aggiorna this.prenotazioni ed effettua una set con il service kvaas
    this.fetchPrenotazioni();
    //Ritorna true se tutto ok, false in caso di errore
  }

  receiveName($event: string) {
    this.formName = $event;
    //Teatro selezionato e nome impostato, posso mostrare il component prenotazione
    this.showPrenotazioni = true;
  }

  receivePrenotazione($event: string) {
    //L'utente ha effettuato una prenotazione oppure ha effettuato logout
    if ($event.startsWith('confirm')) {
      let data: string = $event.substring($event.indexOf(':') + 1);
      this.doConfirm(data);
      return;
    } else if ($event === 'exit') {
      this.doLogout();
      return;
    }
    alert('Errore tecnico');
    this.doLogout();
  }

  private doLogout() {
    this.userInputKey = undefined;
    this.messagePar = undefined;
    this.showMessagePar = false;
    this.showPrenotazioni = false;
    this.selezione = undefined;
    this.showFormName = false;
    this.showT = true;
  }

  private doConfirm(data: string) {
    //TODO implement
    console.log('DOCONFIRM DATA:' + data);
    /*if (!this.requestPrenotazione(data, this.formName)) {
      //Errore nella prenotazione
      return;
    }*/

    //Prenotazione effettuata
    this.messagePar =
      'Successo! ' +
      this.formName +
      ', ti aspettiamo stasera al teatro ' +
      this.teatroSel.getId() +
      ' per vedere ' +
      this.teatroSel.getSpettacolo() +
      '!';
    this.showMessagePar = true;

    //Per tornare alla schermata iniziale usare doLogout(), altrimenti basta fare refresh UI con showPrenotazioni
    this.showPrenotazioni = false;
    setTimeout(() => {
      this.showMessagePar = false;
      //this.doLogout();
      this.showPrenotazioni = true;
    }, 30000); //TODO reimpostare a 10000
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

  private prenotazioni: Array<string>[];

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

  public updateTheater(JSONData: any) {
    //TODO Controllo key prima di aggiornare
    //Funzione usata per aggiornare il teatro con le prenotazioni ottenute da kvaas
    let json: any = JSON.parse(JSONData);
    for (let i = 0; i < this.filePlatea; i++) {
      for (let j = 0; j < this.filePalchi; j++) {
        console.log(json.data[i][j]);
        //this.platea[i][j] = json.data[i][j]
      }
    }
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
    return structuredClone(this.platea);
  }

  public getPalchi() {
    return structuredClone(this.palchi);
  }

  //TODO Aggiungere setter per implementazione bottone aggiungi teatro
}
