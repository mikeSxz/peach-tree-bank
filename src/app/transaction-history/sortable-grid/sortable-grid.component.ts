import { DecimalPipe } from '@angular/common';
import {
  Component,
  QueryList,
  ViewChildren,
  Input,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';

import { SortableDirective, SortEvent } from './../../sortable.directive';
import { RecordService } from './../transactions.service';
import { Record } from '../transaction';

@Component({
  selector: 'app-sortable-grid',
  templateUrl: './sortable-grid.component.html',
  styleUrls: ['./sortable-grid.component.css'],
  providers: [RecordService, DecimalPipe],
})
export class SortableGridComponent {
  records$: Observable<Record[]>;
  total$: Observable<number>;

  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>;
  @Input() responseRecords;

  constructor(public service: RecordService) {
    this.records$ = service.records$;
    this.total$ = service.total$;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;    
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if (
      changes &&
      changes.responseRecords &&
      changes.responseRecords.currentValue &&
      JSON.stringify(changes.responseRecords.currentValue) !==
        (changes.responseRecords.previousValue
          ? JSON.stringify(changes.responseRecords.previousValue)
          : changes.responseRecords.previousValue)
    ) {
      this.service.setRecords(changes.responseRecords.currentValue);
      let transactions = this.service._search();
      console.log(transactions);
      this.service.setSearch(transactions);
    }
  }

  toReadableMonthAndDay(millis: number) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const dateFromMillis = new Date(millis);

    return monthNames[dateFromMillis.getMonth()].substr(0,3) + " "+ dateFromMillis.getDate();
  }

  updateGrid(records) {
    this.service.setSearch(records);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.updateGrid( this.records$);
  }

  
}
