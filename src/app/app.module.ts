import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NominativoComponent } from './nominativo/nominativo.component';
import { PrenotazioneComponent } from './prenotazione/prenotazione.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, NominativoComponent, PrenotazioneComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
