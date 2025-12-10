import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-typeahead',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.css'],
})
export class TypeaheadComponent<T = any> {
  @Input() items: T[] = [];
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';
  @Input() placeholder: string = '';
  @Input() minChars: number = 1;

  @Output() select = new EventEmitter<T>();

  query: string = '';
  filtered: T[] = [];
  focusedIndex: number = -1;

  onInput() {
    const q = (this.query || '').toLowerCase();
    if (q.length < this.minChars) {
      this.filtered = [];
      return;
    }
    this.filtered = this.items.filter((it: any) => ((it[this.displayField] || '') + '').toLowerCase().includes(q));
    this.focusedIndex = -1;
  }

  choose(item: T) {
    this.select.emit(item);
    this.query = (item as any)[this.displayField] || '';
    this.filtered = [];
  }

  onKeydown(e: KeyboardEvent) {
    if (!this.filtered || this.filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focusedIndex = Math.min(this.focusedIndex + 1, this.filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.focusedIndex >= 0 && this.focusedIndex < this.filtered.length) {
        this.choose(this.filtered[this.focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      this.filtered = [];
    }
  }

  getDisplay(item: T): string {
    try {
      const v = (item as any)[this.displayField];
      return v !== undefined && v !== null ? `${v}` : '';
    } catch {
      return '';
    }
  }
}
