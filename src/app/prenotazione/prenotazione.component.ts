import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Teatro } from '../app.component';

@Component({
  selector: 'prenotazione',
  templateUrl: './prenotazione.component.html',
  styleUrls: ['./prenotazione.component.css'],
})
export class PrenotazioneComponent implements OnInit, OnChanges {
  @Input() name: string;
  @Input() th: Teatro;
  @Output() prenotazioneEvent = new EventEmitter<string>();

  buttonsPlatea: Array<string>[];
  buttonsPalchi: Array<string>[];

  private npostiPalchi: number;
  private postiPlatea: Array<string> = [];
  private postiPalchi: Array<string> = [];

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.name = changes.name.currentValue;
    this.th = changes.th.currentValue;
    this.buildUI();
  }

  //Funzione usata per costruire l'interfaccia con bottoni
  buildUI() {
    this.buttonsPlatea = this.th.getPlatea();
    this.buttonsPlatea.map((fila, indiceFila) => {
      let p = fila.map((nome, indicePosto) => {
        let posto: string = '';
        posto = posto.concat(
          this.getLetter(indiceFila) + (indicePosto + 1) + '- ' + nome
        );
        this.buttonsPlatea[indiceFila][indicePosto] = posto;
      });
    });

    this.buttonsPalchi = this.th.getPalchi();
    let i: number = 0;
    this.buttonsPalchi.map((fila, indiceFila) => {
      let p = fila.map((nome, indicePosto) => {
        let posto: string = '';
        posto = posto.concat('Pa ' + (i + 1) + '- ' + nome);
        this.buttonsPalchi[indiceFila][indicePosto] = posto;
        i++;
      });
    });
  }

  addPostoPlatea(fila: number, posto: number) {
    this.postiPlatea.push(fila + '-' + posto);
    console.log('FILA: ' + fila + ' POSTO: ' + posto);
  }

  addPostoPalchi(fila: number, posto: number) {
    this.postiPalchi.push(fila + '-' + posto);
  }

  warnPosto(posto: string) {
    alert('Il posto selezionato è già stato prenotato');
  }

  exit() {
    this.prenotazioneEvent.next('exit');
  }

  confirm() {
    //Unica richiesta sequenziale per coerenza DB
    //this.th.requestPrenotazione(this.posti, this.name);
    console.log(this.postiPlatea.concat(this.postiPalchi));
    this.prenotazioneEvent.next('confirm');
  }

  //Associa una lettera ad un indice per maggiore leggibilità
  getLetter(index: number) {
    const a: number = 'A'.charCodeAt(0);
    let res: number = a + index;
    return String.fromCharCode(res);
  }

  getCurrentPostiPlatea() {
    let posti: string[] = [];
    this.postiPlatea.forEach((seat) => {
      let indexFila: number = +seat.substring(0, 1);
      let indexPosto: number = +seat.substring(2);
      posti.push(this.getLetter(indexFila) + (indexPosto + 1));
    });
    return posti;
  }
  getCurrentPostiPalchi() {
    let posti: string[] = [];
    let postiPalchi: number = this.th.getPostiPalchi();
    let filePalchi: number = this.th.getFilePalchi();
    let tot: number = postiPalchi * filePalchi;
    this.postiPalchi.forEach((seat) => {
      let indexFila: number = +seat.substring(0, 1);
      let indexPosto: number = +seat.substring(2);
      let i: number = indexFila + 1;
      let j: number = indexPosto + 1;

      //Grazie anche a Domenico per la serata passata a trovare questa formula :)
      posti.push('Pa ' + (i * j + (postiPalchi - j) * (i - 1)));
    });
    return posti;
  }

  ngOnInit() {}
}
