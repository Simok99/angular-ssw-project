import { Component, OnInit, Input } from '@angular/core';
import { Teatro } from '../app.component';

@Component({
  selector: 'prenotazione',
  templateUrl: './prenotazione.component.html',
  styleUrls: ['./prenotazione.component.css'],
})
export class PrenotazioneComponent implements OnInit {
  @Input() th: Teatro;
  @Input() name: string;

  visible: boolean = false;
  constructor() {
    if (this.th !== undefined && this.th !== null) {
      if (this.name !== undefined && this.name !== null) this.visible = true;
    }
  }

  ngOnInit() {}
}
