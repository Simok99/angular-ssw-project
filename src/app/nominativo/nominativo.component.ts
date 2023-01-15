import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'nominativo',
  templateUrl: './nominativo.component.html',
  styleUrls: ['./nominativo.component.css'],
})
export class NominativoComponent implements OnInit {
  @Input() visible: boolean;
  @Output() nameEvent = new EventEmitter<string>();
  constructor() {}
  private name: string;

  setName(name: string) {
    if (!this.checkName(name)) return;
    this.name = name;
    this.nameEvent.next(this.name);
    this.visible = false;
  }

  private checkName(name: string) {
    let maxNameLength: number = 8;
    let minNameLength: number = 2;
    let invalidChars: string[] = [
      ' ',
      '!',
      '$',
      '£',
      '"',
      '%',
      '/',
      '=',
      '\\',
      '|',
    ];
    if (name === undefined || name === null) {
      alert('Nome non valido.');
      return false;
    }
    if (name.length < minNameLength) {
      alert('Il nome deve essere lungo almeno ' + minNameLength + ' caratteri');
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
