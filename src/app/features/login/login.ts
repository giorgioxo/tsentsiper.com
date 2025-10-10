import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe({
        next: (token) => {
          if (token) {
            this.router.navigate(['/admin']);
          } else {
            this.errorMessage = 'Invalid username or password';
          }
        },
        error: (error) => {
          this.errorMessage = 'Login failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }
}
