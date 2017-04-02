import { Component, Input } from '@angular/core';
import { Login } from './login';
import { LoginService } from './login.service';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})

export class LoginComponent {
  @Input()
  login: Login;

  @Input()
  loginHandler: Function;

  constructor (private loginService: LoginService) {}

  doLogin(login: Login) {
    const login2 = this.loginService.doLogin(login);
    this.loginHandler(login2);
  }
}
