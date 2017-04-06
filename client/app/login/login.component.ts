import { Component, Input, OnInit } from '@angular/core';
import { Login } from './login';
import { LoginService } from './login.service';

@Component({
  selector: 'admin-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
  providers: [LoginService]
})

export class LoginComponent implements OnInit {
  @Input()
  login: Login;

  @Input()
  loginHandler: Function;

  ngOnInit() {
    return;
  }
  
  constructor (private loginService: LoginService) {}

  doLogin(login: Login) {
    const login2 = this.loginService.doLogin(login);
    this.loginHandler(login2);
  }
}
