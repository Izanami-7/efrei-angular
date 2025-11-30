import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight!: number;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.appHighlight > 100) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'color', '#ff5f00');
      this.renderer.setStyle(this.elementRef.nativeElement, 'font-weight', 'bold');
    }
  }
}
