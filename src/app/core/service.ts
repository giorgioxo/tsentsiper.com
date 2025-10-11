import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse {
  success: boolean;
  count: number;
  data: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private projectDataSubject = new BehaviorSubject<string[]>([]);
  public projectData$ = this.projectDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProjectData();
  }

  // Load project data from backend
  loadProjectData(): void {
    console.log('Loading data from:', `${this.apiUrl}/projects`);
    
    this.http.get<ApiResponse>(`${this.apiUrl}/projects`)
      .pipe(
        tap(response => {
          console.log('API Response:', response);
          if (response.success && response.data) {
            console.log('Setting project data:', response.data.length, 'items');
            this.projectDataSubject.next(response.data);
          } else {
            console.warn('Invalid API response format');
          }
        }),
        catchError(error => {
          console.error('Failed to load data from backend:', error);
          return of({ success: false, count: 0, data: [] });
        })
      )
      .subscribe({
        next: () => console.log('Data subscription completed'),
        error: (err) => console.error('Subscription error:', err)
      });
  }

  // Get project data synchronously (returns current value)
  getProjectData(): string[] {
    return this.projectDataSubject.value;
  }

  // Get project data as Observable
  getProjectDataObservable(): Observable<string[]> {
    return this.projectData$;
  }

  // Update project data (for CRUD operations)
  updateProjectData(data: string[]): void {
    this.projectDataSubject.next(data);
  }

  // Add new project
  addProject(project: string): void {
    const text = project?.trim();
    if (!text) return;
    this.http.post<ApiResponse>(`${this.apiUrl}/projects`, { text })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.projectDataSubject.next(response.data);
          }
        }),
        catchError(error => {
          console.error('Failed to add project:', error);
          return of({ success: false, count: 0, data: this.projectDataSubject.value });
        })
      )
      .subscribe();
  }

  // Update project by index
  updateProject(index: number, project: string): void {
    const text = project?.trim();
    if (!text) return;
    this.http.put<ApiResponse>(`${this.apiUrl}/projects/${index}`, { text })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.projectDataSubject.next(response.data);
          }
        }),
        catchError(error => {
          console.error('Failed to update project:', error);
          return of({ success: false, count: 0, data: this.projectDataSubject.value });
        })
      )
      .subscribe();
  }

  // Delete project by index
  deleteProject(index: number): void {
    this.http.delete<ApiResponse>(`${this.apiUrl}/projects/${index}`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.projectDataSubject.next(response.data);
          }
        }),
        catchError(error => {
          console.error('Failed to delete project:', error);
          return of({ success: false, count: 0, data: this.projectDataSubject.value });
        })
      )
      .subscribe();
  }
}
