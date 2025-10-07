import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private isMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public isMenuOpen$ = this.isMenuOpenSubject.asObservable();

  setMenuOpen(isOpen: boolean) {
    this.isMenuOpenSubject.next(isOpen);
  }

  getMenuOpen(): boolean {
    return this.isMenuOpenSubject.value;
  }
}
