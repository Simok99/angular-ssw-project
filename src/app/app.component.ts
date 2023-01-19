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
    this.fetchPrenotazioni();
    this.showFormName = true;
  }

  private updateTheaterFromDB(newT: any) {
    console.log(this.teatroSel);
    //Object.assign copia tutti i valori del JSON nei campi del'oggetto target
    Object.assign(this.teatroSel, newT);
  }

  private fetchPrenotazioni() {
    //Effettua un refresh dei dati delle prenotazioni dal service kvaas
    this.kvaas.getData(this.userInputKey).subscribe({
      next: (data: any) => {
        let response: string = data;
        if (response.search('non esiste') !== -1) {
          this.messagePar =
            'Errore: Impossibile caricare le prenotazioni dal server. (chiave non trovata)';
          this.showMessagePar = true;
          setTimeout(() => {
            this.showMessagePar = false;
          }, 3000);
          return false;
        }

        this.updateTheaterFromDB(JSON.parse(data));
        return true;
      },
      error: (e) => {
        this.messagePar =
          'Impossibile caricare le prenotazioni dal server. Errore: ' + e;
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
        }, 3000);
        this.doLogout();
        return false;
      },
    });
    return true;
  }

  private requestPrenotazione(posti: string, nome: string) {
    //Aggiorna i dati delle prenotazioni
    if (!this.fetchPrenotazioni()) return false; //Impossibile caricare le prenotazioni dal DB

    //Controlla che i posti selezionati siano disponibili
    let currentPlatea: Array<string>[] = this.teatroSel.getPlatea();
    let currentPalchi: Array<string>[] = this.teatroSel.getPalchi();

    let requestedPosti: Array<string> = posti.split(';');

    let requestedPostiPlatea: Array<string> = requestedPosti[0]
      .replace('platea:', '')
      .split(',');
    let requestedPostiPalchi: Array<string> = requestedPosti[1]
      .replace('palchi:', '')
      .split(',');

    for (let filaPosto of requestedPostiPlatea) {
      let fila: number = +filaPosto.substring(0, filaPosto.indexOf('-'));
      let posto: number = +filaPosto.substring(filaPosto.indexOf('-') + 1);

      if (currentPlatea[fila][posto].length > 0) {
        //Posto richiesto già prenotato
        return false;
      }
      //Posto libero, lo prenoto
      currentPlatea[fila][posto] = nome;
    }

    for (let filaPosto of requestedPostiPalchi) {
      let fila: number = +filaPosto.substring(0, filaPosto.indexOf('-'));
      let posto: number = +filaPosto.substring(filaPosto.indexOf('-') + 1);

      if (currentPalchi[fila][posto].length > 0) {
        //Posto richiesto già prenotato
        return false;
      }
      //Posto libero, lo prenoto
      currentPalchi[fila][posto] = nome;
    }

    //Tutti i posti richiesti sono segnati come prenotati, effettuo una set sul DB
    if (!this.setPrenotazioni(currentPlatea, currentPalchi)) {
      alert('Errore: Impossibile salvare la prenotazione sul server.');
      return false;
    }

    //Prenotazione effettuata
    return true;
  }

  private setPrenotazioni(
    currentPlatea: Array<string>[],
    currentPalchi: Array<string>[]
  ) {
    //Effettua una set con il service kvaas
    //Ritorna true se tutto ok, false in caso di errore

    let newPlatea: Array<string>[] = this.teatroSel.getPlatea();
    let newPalchi: Array<string>[] = this.teatroSel.getPalchi();

    currentPlatea.forEach((fila, indiceFila) => {
      fila.forEach((nome, indicePosto) => {
        if (nome !== '') {
          newPlatea[indiceFila][indicePosto] = nome;
        }
      });
    });
    currentPalchi.forEach((fila, indiceFila) => {
      fila.forEach((nome, indicePosto) => {
        if (nome !== '') {
          newPalchi[indiceFila][indicePosto] = nome;
        }
      });
    });

    this.teatroSel.setPlatea(newPlatea);
    this.teatroSel.setPalchi(newPalchi);

    this.kvaas.setData(this.userInputKey, this.teatroSel).subscribe({
      next: (data: any) => {
        let response: string = data;
        if (response.search('400') !== -1) {
          this.messagePar =
            'Errore: Impossibile salvare la prenotazione sul server. (chiave non trovata)';
          this.showMessagePar = true;
          setTimeout(() => {
            this.showMessagePar = false;
          }, 3000);
          return false;
        }
      },
      error: (e) => {
        this.messagePar =
          'Impossibile salvare la prenotazione sul server. Errore: ' + e;
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
        }, 3000);
        return false;
      },
    });

    //Prenotazione salvata sul server
    return true;
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
    if (!this.requestPrenotazione(data, this.formName)) {
      //Errore nella prenotazione
      return;
    }

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

    alert('Prenotazione effettuata!');

    //Per tornare alla schermata iniziale uso doLogout()
    setTimeout(() => {
      this.doLogout();
    }, 20000);
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

  /*public updateTheater(data: string) {
    //TODO Controllo key prima di aggiornare
    //Funzione usata per aggiornare il teatro con l'oggetto ottenuto da kvaas
    //let json: any = JSON.parse(JSONData);
    /*console.log('DATA RECEIVED:' + data);
    let file: Array<string>[] = JSON.parse('[' + data + ']');
    console.log(file);
    let counter = 0;
    file.forEach((fila, indiceFila) => {
      fila.forEach((nome, indicePosto) => {
        if (counter < this.getFilePlatea() && nome !== '') {
          this.platea[indiceFila][indicePosto] = nome;
        }
        if (nome !== '') {
          this.palchi[indiceFila][indicePosto] = nome;
        }
        counter++;
      });
    });
  }*/

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

  public setPlatea(platea: Array<string>[]) {
    this.platea = platea;
  }

  public getPalchi() {
    return structuredClone(this.palchi);
  }

  public setPalchi(palchi: Array<string>[]) {
    this.palchi = palchi;
  }

  //TODO Aggiungere setter per implementazione bottone aggiungi teatro
}
