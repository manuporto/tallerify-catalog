import { Injectable } from '@angular/core';
import { Login } from './login';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LoginService {
  constructor(private http: Http) { }

  // TODO create return type for doLogin (a token or something)
  doLogin(login: Login): Login {
    return login;
  }
}
