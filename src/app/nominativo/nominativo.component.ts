import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'nominativo',
  templateUrl: './nominativo.component.html',
  styleUrls: ['./nominativo.component.css'],
})
export class NominativoComponent implements OnInit {
  @Input() visible: boolean;
  constructor() {}
  private name: string;

  setName(name: string) {
    if (!this.checkName(name)) return;
    this.name = name;
    this.visible = false;
    //TODO Passare nome a component prenotazione
  }

  private checkName(name: string) {
    let maxNameLength: number = 8;
    let invalidChars: string[] = ['!', '$', '£', '"', '%', '/', '=', '\\', '|'];
    if (name === undefined || name === null) {
      alert('Nome non valido.');
      return false;
    }
    if (name.length > maxNameLength) {
      alert(
        'Il nome può essere lungo al massimo ' + maxNameLength + ' caratteri'
      );
      return false;
    }
    if (invalidChars.some((char) => name.includes(char))) {
      alert('Il nome non può contenere caratteri speciali');
      return false;
    }
    return true;
  }

  ngOnInit() {}
}
