import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {data} from 'src/mock/transactions.json';


@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  configUrl = 'assets/mock/transactions.json';



  constructor(private http: HttpClient) {
   
  }

  getConfig() {
    return data;
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.configUrl);
  }
}
