import { Component, OnInit, Input } from '@angular/core';
import { CategoryService } from '../shared/services/category.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  @Input() playerName: string = '';
  categories: any[] = [];
  filteredCategories: any[] = [];
  searchTerm: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isUserConnected();
    this.playerName = this.authService.user?.username || '';
    this.categoryService.getCategories().subscribe((categories: any) => {
      this.categories = categories;
      this.filteredCategories = categories;
    });
  }

  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(category =>
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.filteredCategories = this.categories;
  }

  navigateToQuiz(categoryId: number): void {
    this.router.navigate(['/quiz', this.playerName, categoryId]);
  }
}
