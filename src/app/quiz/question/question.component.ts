import { Component, OnInit, Input } from '@angular/core';
import { QuizService } from "../../shared/services/quiz.service";

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  standalone: false
})
export class QuestionComponent implements OnInit {
  @Input() categoryId: number | null = null;
  
  get quizContent(): any[] {
    return this.quizService.quizContent;
  }

  constructor(
    private quizService: QuizService
  ) { }

  ngOnInit(): void {
  }

  addAnswer(answer: string, questionId: number) {
    this.quizService.addAnswer(answer, questionId);
  }
}
