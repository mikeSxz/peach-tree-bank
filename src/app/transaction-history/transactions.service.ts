import { DecimalPipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';

import { SortColumn, SortDirection } from './../sortable.directive';
import { Record } from './transaction';

interface SearchResult {
  records: Record[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
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

function sort(
  records: Record[],
  column: SortColumn,
  direction: string
): Record[] {
  if (direction === '' || column === '') {
    return records;
  } else {
    return [...records].sort((a, b) => {
      if (a && b && column) {
        if (column.toString() === 'date') {
          const res = compare(a['dates']['valueDate'], b['dates']['valueDate']);

          return direction === 'asc' ? res : -res;
        }

        if (column.toString() === 'beneficiary') {
          const res = compare(a['merchant']['name'], b['merchant']['name']);

          return direction === 'asc' ? res : -res;
        }

        if (column.toString() === 'amount') {          
          const res = compare(
            Number(a['transaction']['amountCurrency']['amount']),
            Number(b['transaction']['amountCurrency']['amount'])
          );

          return direction === 'asc' ? res : -res;
        }
      }
    });
  }
}

function matches(record: Record, term: string, pipe: PipeTransform) {
  return (
    record.merchant.name.toLowerCase().includes(term.toLowerCase()) ||
    monthNames[new Date(record.dates.valueDate).getMonth()]
      .toLowerCase()
      .includes(term.toLowerCase()) ||
    new Date(record.dates.valueDate).getDate().toString().includes(term) ||
    pipe.transform(record.transaction.amountCurrency.amount).includes(term)
  );
}

@Injectable({ providedIn: 'root' })
export class RecordService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _records$ = new BehaviorSubject<Record[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private records = [];

  public setRecords(records: Record[]) {
    this.records = records;
  }

  public getRecords() {
    return this.records;
  }

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: DecimalPipe) {}

  get records$() {
    return this._records$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  setSearch(records?: any) {
    records
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._records$.next(result.records);
        this._total$.next(result.total);
        this._loading$.next(false);
      });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  public _search(): Observable<SearchResult> {
    const {
      sortColumn,
      sortDirection,
      pageSize,
      page,
      searchTerm,
    } = this._state;

    // 1. sort
    let records = sort(this.records, sortColumn, sortDirection);

    // 2. filter
    records = records.filter((record) =>
      matches(record, searchTerm, this.pipe)
    );
    const total = records.length;

    // 3. paginate
    records = records.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ records, total });
  }
}
