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

  private posti: Array<string> = [];

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
          this.getLetter(indiceFila) + (indicePosto + 1) + ' ' + nome
        );
        this.buttonsPlatea[indiceFila][indicePosto] = posto;
      });
    });

    this.buttonsPalchi = this.th.getPalchi();
    let i: number = 0;
    this.buttonsPalchi.map((fila, indiceFila) => {
      let p = fila.map((nome, indicePosto) => {
        let posto: string = '';
        posto = posto.concat('Pa ' + (i + 1) + ' ' + nome);
        this.buttonsPalchi[indiceFila][indicePosto] = posto;
        i++;
      });
    });
  }

  addPosto(posto: string) {
    this.posti.push(posto);
    //TODO controllare id posto nel teatro
    //this.prenotazione.push(idPosto);
  }

  warnPosto(posto: string) {
    alert('Il posto selezionato è già stato prenotato');
  }

  exit() {
    this.prenotazioneEvent.next('exit');
  }

  confirm() {
    this.prenotazioneEvent.next('confirm');
  }

  //Associa una lettera ad un indice per maggiore leggibilità
  getLetter(index: number) {
    const a: number = 'A'.charCodeAt(0);
    let res: number = a + index;
    return String.fromCharCode(res);
  }

  getCurrentPosti() {
    return this.posti;
  }

  ngOnInit() {}
}
