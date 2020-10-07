import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  AmountCurrency,
  Dates,
  Merchant,
  Record,
  Transaction,
} from '../transaction-history/transaction';
import { MessageService } from './../service/message.service';
import { RecordService } from './../transaction-history/transactions.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  providers: [RecordService, DecimalPipe],
})
export class TransactionComponent implements OnInit {
  transactionForm = new FormGroup({
    from: new FormControl({ value: 'Backbase', disabled: true }, [
      Validators.required,
      Validators.minLength(4),
    ]),
    to: new FormControl('', [Validators.required, Validators.minLength(4)]),
    amount: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  allTransactions = [];
  messages: any[] = [];
  subscription: Subscription;

  constructor(
    public transactionsService: RecordService,
    private messageService: MessageService
  ) {
    this.subscription = this.messageService
      .getMessage()
      .subscribe((message) => {
        if (message) {
          this.messages = message;
          this.allTransactions = this.messages;
        } else {
          this.messages = [];
        }
      });
  }

  ngOnInit(): void {}

  addTransaction() {
    const from = this.transactionForm.get('from').value;
    const to = this.transactionForm.get('to').value;
    const amount = this.transactionForm.get('amount').value;
    this.addNewRecord(from, to, amount);
    this.sendMessage();

    this.transactionForm.get('to').setValue('');
    this.transactionForm.get('amount').setValue('');
    
  }

  addNewRecord(from: string, to: string, amount: number) {
    let dates = <Dates>{
      valueDate: new Date().getTime(),
    };

    let AmountCurrencyCurrency = <AmountCurrency>{
      amount: amount,
      currencyCode: 'MXN',
    };

    let transaction = <Transaction>{
      amountCurrency: AmountCurrencyCurrency,
      type: 'Salaries',
      creditDebitIndicator: 'CRDT',
    };

    let merchant = <Merchant>{
      name: to,
      accountNumber: 'SI64397745065188826',
    };

    let record = <Record>{
      categoryCode: '#c12020',
      dates: dates,
      transaction: transaction,
      merchant: merchant,
    };

    this.allTransactions.push(record);
  }

  sendMessage(): void {
    this.messageService.sendMessage(this.allTransactions);
  }

  clearMessages(): void {
    this.messageService.clearMessages();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
