import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import PocketBase, { BaseAuthStore } from 'pocketbase'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private pb!: PocketBase;

  todos = signal<Todo[]>([]);

  authStore!: BaseAuthStore;
  model: Todo = {
    title: '',
    details: ''
  };

  async ngOnInit() {
    this.pb = new PocketBase('http://127.0.0.1:8090');
    this.authStore = this.pb.authStore;

    this.pb.collection('todos').subscribe('*', _ => this.hydrateTodos());

    await this.hydrateTodos();
  }

  async login() {
    await this.pb.collection('users').authWithPassword('komla@yopmail.com', 'password');

    await this.hydrateTodos();
  }

  async logout() {
    this.authStore.clear();
    this.todos.set([]);
  }

  async createTodo() {
    await this.pb.collection('todos').create<Todo>({
      ...this.model,
      user: this.authStore.model?.['id']
    });

    this.model = {
      title: '',
      details: ''
    }
  }

  async hydrateTodos() {
    try {
      const res = await this.pb.collection('todos').getFullList<Todo>();

      this.todos.set(res);
    } catch (e) {
      console.error('Failed to fetch todos', e);
    }
  }
}


export interface Todo {
  id?: string;
  title: string;
  details?: string;
  created?: Date;
  user?: string;
}