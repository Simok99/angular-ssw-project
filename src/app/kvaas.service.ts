import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class KvaasService {
  private secret: string = 'ssw2022';
  private firstTheaterKey: string = 's';

  private newURL: string =
    'https://eu-central-1.aws.data.mongodb-api.com/app/kvaas-giwjg/endpoint/new?secret=' +
    this.secret;

  private getURL: string =
    'https://eu-central-1.aws.data.mongodb-api.com/app/kvaas-giwjg/endpoint/get?key=';

  private setURL: string =
    'https://eu-central-1.aws.data.mongodb-api.com/app/kvaas-giwjg/endpoint/set?key=';

  constructor(private http: HttpClient) {}

  public matchDefaultKey(inputKey: string) {
    if (inputKey === this.firstTheaterKey) return true;
    return false;
  }

  public newAPIKey(): Observable<Object> {
    return this.http.get(this.newURL);
  }

  public getData(thKey: string): Observable<Object> {
    //TODO se thKey === firstTheaterKey teatro base, altrimenti c'è stato overwrite nel DB OPPURE si vuole
    //creare un nuovo teatro
    return this.http.get(JSON.parse(this.getURL + thKey));
  }

  public setData(thKey: string, value: Object): Observable<Object> {
    return this.http.post(this.setURL + thKey, JSON.stringify(value));
  }
}
