import { Directive, ElementRef, OnInit, OnDestroy, Self } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown'; // Import MarkdownComponent
import { Subscription } from 'rxjs';

@Directive({
  selector: 'markdown[addListClass]', // Attribute selector for <markdown> tags
  standalone: true, // Remove if not using standalone components
})
export class ListClassDirective implements OnInit, OnDestroy {
  private readySubscription: Subscription | undefined;

  constructor(
    private elementRef: ElementRef<HTMLElement>, // The <markdown> element itself
    @Self() private markdownComponent: MarkdownComponent // Get the component instance this directive is attached to
  ) {}

  ngOnInit(): void {
    // Subscribe to the ready event of this specific MarkdownComponent instance
    this.readySubscription = this.markdownComponent.ready.subscribe(() => {
      this.addClassesToLists();
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    this.readySubscription?.unsubscribe();
  }

  private addClassesToLists(): void {
    // Access the native element where markdown content is rendered
    const markdownElement = this.elementRef.nativeElement;

    if (markdownElement) {
      // Find all <ul> and <ol> elements *within* the markdown container
      const lists = markdownElement.querySelectorAll('ul, ol');

      // Add the 'list' class to each found element
      lists.forEach((listElement: Element) => { // Explicitly type listElement
        listElement.classList.add('list');
      }); }
  }
}