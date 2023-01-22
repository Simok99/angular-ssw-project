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

  confirmDisabled: boolean = false;

  buttonsPlatea: Array<string>[];
  buttonsPalchi: Array<string>[];

  private postiPlatea: Array<string> = [];
  private postiPalchi: Array<string> = [];

  postiPrenotati: Array<string> = [];

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
    let value: string = fila + '-' + posto;
    this.postiPlatea.push(value);
    this.postiPrenotati.push(this.getLetter(fila) + (posto + 1));
  }

  removePostoPlatea(fila: number, posto: number) {
    let index: number = this.postiPrenotati.indexOf(
      this.getLetter(fila) + (posto + 1)
    );
    this.postiPrenotati.splice(index, 1);
  }

  addPostoPalchi(fila: number, posto: number) {
    let value: string = fila + '-' + posto;
    this.postiPalchi.push(value);
    let postiPalchi: number = this.th.getPostiPalchi();
    let i: number = fila + 1;
    let j: number = posto + 1;

    //Grazie anche a Domenico per la serata passata a trovare questa formula :)
    this.postiPrenotati.push('Pa ' + (i * j + (postiPalchi - j) * (i - 1)));
  }

  removePostoPalchi(fila: number, posto: number) {
    let postiPalchi: number = this.th.getPostiPalchi();
    let i: number = fila + 1;
    let j: number = posto + 1;
    let index: number = this.postiPrenotati.indexOf(
      'Pa ' + (i * j + (postiPalchi - j) * (i - 1))
    );
    this.postiPrenotati.splice(index, 1);
  }

  warnPosto() {
    alert('Il posto selezionato è già stato prenotato');
  }

  exit() {
    this.prenotazioneEvent.next('exit');
  }

  confirm() {
    this.confirmDisabled = true;
    let data: string =
      'confirm:platea:' + this.postiPlatea + ';palchi:' + this.postiPalchi;
    this.prenotazioneEvent.next(data);
  }

  //Associa una lettera ad un indice per maggiore leggibilità
  getLetter(index: number) {
    const a: number = 'A'.charCodeAt(0);
    let res: number = a + index;
    return String.fromCharCode(res);
  }

  ngOnInit() {}
}
