import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { UserDetailsComponent } from '../user-details/user-details.component';

@Component({
  selector: 'user-list',
  templateUrl: 'user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [UserService]
})

export class UserListComponent implements OnInit {

  users: User[]
  selectedUser: User

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService
      .getUsers()
      .then((users: User[]) => {
        this.users = users.map((user) => {
          return user;
        });
      });
  }

  private getIndexOfUser = (userId: String) => {
    return this.users.findIndex((user) => {
      return user._id === userId;
    });
  }

  selectUser(user: User) {
    this.selectedUser = user
  }

  createNewUser = () => {
    var user: User = {
      userName: '',
      firstName: '',
      lastName: '',
      country: '',
      email: '',
      birthdate: '',
      images: ['']
    }
    // By default, a newly-created user will have the selected state.
    this.selectUser(user);
  }

  deleteUser = (userId: String) => {
    var idx = this.getIndexOfUser(userId);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      this.selectUser(null);
    }
    return this.users;
  }

  addUser = (user: User) => {
    this.users.push(user);
    this.selectUser(user);
    return this.users;
  }

  updateUser = (user: User) => {
    var idx = this.getIndexOfUser(user._id);
    if (idx !== -1) {
      this.users[idx] = user;
      this.selectUser(user);
    }
    return this.users;
  }
}
