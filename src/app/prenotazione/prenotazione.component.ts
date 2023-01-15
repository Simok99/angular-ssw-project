import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
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

  buttonsPlatea: Array<HTMLButtonElement> = [];
  buttonsPalchi: Array<HTMLButtonElement> = [];

  prenotazione: Array<string> = [];

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.name = changes.name.currentValue;
    this.th = changes.th.currentValue;
    this.buildUI();
  }

  //Funzione usata per costruire l'interfaccia con bottoni
  buildUI() {
    let platea = this.th.getPlatea();
    platea.map((fila, indiceFila) => {
      let p = fila.map((nome, indicePosto) => {
        let newButton = document.createElement('button');
        newButton.innerHTML = this.getLetter(indiceFila) + (indicePosto + 1);
        newButton.value = nome;
        newButton.style.color = nome !== '' ? 'grey' : 'red';
        this.buttonsPlatea.push(newButton);
      });
    });

    let palchi = this.th.getPalchi();
    palchi.map((fila, indiceFila) => {
      let p = fila.map((nome, indicePosto) => {
        let newButton = document.createElement('button');
        let displayName: string = '';
        if (nome !== '') {
          displayName = '<br />' + nome;
        }
        newButton.innerHTML =
          this.getLetter(indiceFila) + (indicePosto + 1) + displayName;
        newButton.value = nome;
        newButton.style.color = nome !== '' ? 'grey' : 'red';
        this.buttonsPalchi.push(newButton);
      });
    });
  }

  addPostoPrenotazione(idPosto: string) {
    console.log(idPosto);
    //TODO controllare id posto nel teatro
    this.prenotazione.push(idPosto);
  }

  //Associa una lettera ad un indice per maggiore leggibilità
  getLetter(index: number) {
    const a: number = 'A'.charCodeAt(0);
    let res: number = a + index;
    return String.fromCharCode(res);
  }

  getCurrentPrenotazione() {
    return this.prenotazione;
  }

  ngOnInit() {}
}
