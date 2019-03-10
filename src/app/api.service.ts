import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Commande } from './commande';
import { Email } from './email';
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
  params:null
};
const apiUrl = "https://olivemirabelle.herokuapp.com/";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  
  sendMail (email:Email){
    return this.http.post(apiUrl+"email/",email, httpOptions)
      .pipe(
        tap(heroes => console.log('send email')),
        catchError(this.handleError('sendMail', []))
      );
  }

  updateCommande (commande:Commande){
    return this.http.put(apiUrl+"reservation/",commande, httpOptions)
      .pipe(
        tap(heroes => console.log('update Commande')),
        catchError(this.handleError('updateCommande', []))
      );
  }
  

  getCommande (id){
    let param = new HttpParams();
   httpOptions.params = param.append('id', id);
    return this.http.get(apiUrl+"reservation/get", httpOptions)
      .pipe(
        tap(heroes => console.log('fetched Commande id')),
        catchError(this.handleError('getCommandes', []))
      );
  }



  getCommandes (){
    return this.http.get(apiUrl+"reservation/getAll", httpOptions)
      .pipe(
        tap(heroes => console.log('fetched All Commandes')),
        catchError(this.handleError('getCommandes', []))
      );
  }

  getCommandesNew (){
    return this.http.get(apiUrl+"reservation/getAllNew", httpOptions)
      .pipe(
        tap(heroes => console.log('fetched New Commandes')),
        catchError(this.handleError('getCommandes', []))
      );
  }

  getCommandesTomorrow (){
    return this.http.get(apiUrl+"reservation/getAllTomorrow", httpOptions)
      .pipe(
        tap(heroes => console.log('fetched Commandes for Tomorrow')),
        catchError(this.handleError('getCommandes Tomorrow', []))
      );
  }
}
