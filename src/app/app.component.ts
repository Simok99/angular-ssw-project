import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  showAddT: boolean = true;
  showAddTPar: boolean = false;
  showThParams: boolean = false;
  showIdParam: boolean = true;
  showTitleParam: boolean = true;
  showFilePlParam: boolean = true;
  showPostiPlParam: boolean = true;
  showFilePaParam: boolean = true;
  showPostiPaParam: boolean = true;

  saveEnabled: boolean = true;
  newAPIKey: string;

  showMessagePar: boolean = false;
  messagePar: string = '';

  showFormName: boolean = false;
  private formName: string;

  showPrenotazioni: boolean = false;

  selectT(id: number) {
    this.showAddT = false;
    for (let teatro of this.teatri) {
      if (teatro.getId() === id) {
        this.selezione = id;
        this.teatroSel = teatro;
        return;
      }
    }
    alert('Errore: teatro non trovato, riprovare');
  }

  addTh() {
    this.showT = false;
    this.showAddT = false;
    this.showAddTPar = true;
  }

  inputSecret(secret: string) {
    if (!this.kvaas.matchSecret(secret)) alert('Segreto errato');
    this.teatroSel = new Teatro(-1, 'undef', -1, -1, -1, -1);
    this.showAddTPar = false;
    this.showThParams = true;
  }

  genKey(): Promise<Object> {
    return firstValueFrom(this.kvaas.newAPIKey());
  }

  setData(key: string): Promise<Object> {
    return firstValueFrom(this.kvaas.setData(key, this.teatroSel));
  }

  saveTh() {
    this.saveEnabled = false;

    this.genKey().then(
      (newKey: string) => {
        this.newAPIKey = newKey;
        this.setData(this.newAPIKey).then(
          (response: string) => {
            if (response.search('400') !== -1) {
              this.messagePar =
                'Errore: Impossibile salvare il nuovo teatro sul server. (chiave non trovata)';
              this.showMessagePar = true;
              setTimeout(() => {
                this.showMessagePar = false;
                this.doLogout();
              }, 3000);
              return;
            }

            //Teatro salvato correttamente
            this.showAddT = false;
            this.showAddTPar = false;
            this.showThParams = false;

            this.messagePar =
              'Successo! Teatro salvato con chiave associata: ' +
              this.newAPIKey +
              '\n Annota la chiave, poi ricarica la pagina.';

            this.showMessagePar = true;

            alert(
              'Nuovo teatro salvato con chiave associata: ' + this.newAPIKey
            );
            return;
          },
          (error: any) => {
            this.messagePar =
              'Impossibile salvare il nuovo teatro sul server. Errore: ' +
              error.toString();
            this.showMessagePar = true;
            setTimeout(() => {
              this.showMessagePar = false;
              this.doLogout();
            }, 3000);
            return;
          }
        );
      },
      (error: any) => {
        this.messagePar =
          'Errore: Impossibile salvare il nuovo teatro sul server. (chiave non generata)' +
          error.toString();
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
          this.saveEnabled = true;
          this.doLogout();
        }, 3000);
        alert('Errore nella generazione della chiave');
        return;
      }
    );
  }

  requestAccess(key: string) {
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
    //this.resetDefaultTh(); //Reimposta le prenotazioni del teatro default
    this.checkPrenotazioni();
    this.showFormName = true;
  }

  private checkPrenotazioni() {
    this.fetchPrenotazioni().then(
      (data: any) => {
        let response: string = data;
        if (response.indexOf('non esiste') !== -1) {
          this.messagePar =
            'Errore: Impossibile caricare le prenotazioni dal server. (chiave non trovata)';
          this.showMessagePar = true;
          setTimeout(() => {
            this.showMessagePar = false;
            this.doLogout();
          }, 3000);
          return;
        }

        //Risposta ok, aggiorno i dati locali
        this.updateTheaterFromDB(JSON.parse(data));
      },
      (error: any) => {
        this.messagePar =
          'Impossibile caricare le prenotazioni dal server. Errore: ' +
          error.toString();
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
          this.doLogout();
        }, 3000);
        return;
      }
    );
  }

  private fetchPrenotazioni() {
    //Effettua un refresh dei dati delle prenotazioni dal service kvaas
    return firstValueFrom(this.kvaas.getData(this.userInputKey));
  }

  private updateTheaterFromDB(newT: any) {
    //Object.assign copia tutti i valori del JSON nei campi del'oggetto target
    Object.assign(this.teatroSel, newT);
  }

  private requestPrenotazione(posti: string, nome: string) {
    //Controlla i dati delle prenotazioni
    this.checkPrenotazioni();

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
      if (filaPosto === '') break;
      let fila: number = +filaPosto.substring(0, filaPosto.indexOf('-'));
      let posto: number = +filaPosto.substring(filaPosto.indexOf('-') + 1);

      if (currentPlatea[fila][posto].length > 0) {
        //Posto richiesto già prenotato
        this.messagePar =
          'Errore: Impossibile salvare la prenotazione sul server. (posto già prenotato)';
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
          this.doLogout();
        }, 3000);
        return;
      }
      //Posto libero, lo prenoto
      currentPlatea[fila][posto] = nome;
    }

    for (let filaPosto of requestedPostiPalchi) {
      if (filaPosto === '') break;
      let fila: number = +filaPosto.substring(0, filaPosto.indexOf('-'));
      let posto: number = +filaPosto.substring(filaPosto.indexOf('-') + 1);

      if (currentPalchi[fila][posto].length > 0) {
        //Posto richiesto già prenotato
        this.messagePar =
          'Errore: Impossibile salvare la prenotazione sul server. (posto già prenotato)';
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
          this.doLogout();
        }, 3000);
        return;
      }
      //Posto libero, lo prenoto
      currentPalchi[fila][posto] = nome;
    }

    //Tutti i posti richiesti sono segnati come prenotati, effettuo una set sul DB
    this.setPrenotazioni(currentPlatea, currentPalchi);
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

    this.setData(this.userInputKey).then(
      (data: any) => {
        let response: string = data;
        if (response.indexOf('400') !== -1) {
          this.messagePar =
            'Errore: Impossibile salvare la prenotazione sul server. (chiave non trovata)';
          this.showMessagePar = true;
          setTimeout(() => {
            this.showMessagePar = false;
            this.doLogout();
          }, 3000);
          return;
        }

        //Prenotazione salvata sul server
        this.showPrenotazioni = false;
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
      },
      (error: any) => {
        this.messagePar =
          'Impossibile salvare la prenotazione sul server. Errore: ' +
          error.toString();
        this.showMessagePar = true;
        setTimeout(() => {
          this.showMessagePar = false;
          this.doLogout();
        }, 3000);
        return;
      }
    );
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
    this.showAddT = true;
  }

  private doConfirm(data: string) {
    this.requestPrenotazione(data, this.formName);
  }

  private resetDefaultTh() {
    //Funzione di utilità che reimposta le prenotazioni per il teatro default
    let teatro: Teatro = new Teatro(1, 'Shakespeare', 7, 4, 10, 6);
    this.teatroSel = teatro;
    this.setData(this.userInputKey);
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
    return structuredClone(this.platea);
  }

  public setId(newId: number) {
    this.id = newId;
  }

  public setSpettacolo(titoloSpettacolo: string) {
    this.spettacolo = titoloSpettacolo;
  }

  public setFilePlatea(nfile: number) {
    this.filePlatea = nfile;
  }

  public setFilePalchi(nfile: number) {
    this.filePalchi = nfile;
  }

  public setPostiPlatea(nposti: number) {
    this.postiPlatea = nposti;
  }

  public setPostiPalchi(nposti: number) {
    this.postiPalchi = nposti;
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
}
