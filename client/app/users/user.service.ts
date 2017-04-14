import { Injectable } from '@angular/core';
import { User } from './user';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {

  private usersUrl = '/api/users';

  constructor(private http: Http) { }

  // get("/api/users")
  getUsers(): Promise<User[]> {
    return this.http.get(this.usersUrl)
      .toPromise()
      .then(response => response.json() as User[])
      .catch(this.handleError);
  }
  // post("/api/users")
  createUser(newContact: User): Promise<User> {
    return this.http.post(this.usersUrl, newContact)
      .toPromise()
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

  // get("/api/users/:id") endpoint not used by Angular app

  // delete("/api/users/:id")
  deleteUser(delUserId: String): Promise<String> {
    return this.http.delete(this.usersUrl + '/' + delUserId)
      .toPromise()
      .then(response => response.json() as String)
      .catch(this.handleError);
  }

  // put("/api/users/:id")
  updateUser(putUser: User): Promise<User> {
    const putUrl = this.usersUrl + '/' + putUser.id;
    return this.http.put(putUrl, putUser)
      .toPromise()
      .then(response => response.json() as User)
      .catch(this.handleError);
  }

  private handleError (error: any) {
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
  }
}
