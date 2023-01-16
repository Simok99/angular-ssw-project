import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NominativoComponent } from './nominativo/nominativo.component';
import { PrenotazioneComponent } from './prenotazione/prenotazione.component';
import { KvaasService } from './kvaas.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpClientModule],
  declarations: [AppComponent, NominativoComponent, PrenotazioneComponent],
  providers: [KvaasService],
  bootstrap: [AppComponent],
})
export class AppModule {}
