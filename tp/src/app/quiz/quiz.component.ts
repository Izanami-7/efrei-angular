import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { QuizService } from "../shared/services/quiz.service";
import { CategoryService } from "../shared/services/category.service";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: false
})
export class QuizComponent implements OnInit {
  isQuizFinished = this.quizService.isQuizFinished;
  playerName = '';
  categoryId: number | null = null;
  categoryName: string = '';

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizService.playerName = params['playerName'];
      this.playerName = params['playerName'];
      this.quizService.resetQuiz();
      if (params['categoryId']) {
        this.categoryId = +params['categoryId'];
        this.quizService.getQuizContent(this.categoryId);
        this.categoryService.getCategoryById(this.categoryId).subscribe((categories: any) => {
          if (categories && categories.length > 0) {
            this.categoryName = categories[0].name;
          }
        });
      } else {
        this.categoryId = null;
        this.categoryName = '';
        this.quizService.getQuizContent();
      }
    });
  }

  goToResultPage() {
    this.router.navigate(['/result']);
  }
}
