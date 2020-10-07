import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from './../config.service';
import { MessageService } from './../service/message.service';
import { AmountCurrency, Dates, Merchant, Record, Transaction } from './transaction';
import { RecordService } from './transactions.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  providers: [RecordService, DecimalPipe],
})
export class TransactionHistoryComponent implements OnInit {
  transact: Record[] = [];
  messages: any[] = [];
  subscription: Subscription;

  constructor(
    public configService: ConfigService,
    public transactionService: RecordService,
    private messageService: MessageService
  ) {
    this.subscription = this.messageService
      .getMessage()
      .subscribe((message) => {
        if (message) {
          this.messages = message;
          this.transact = this.messages;
        } else {
          
          this.messages = [];
        }
      });
  }

  ngOnInit(): void {
    this.getTransactions();
    this.sendMessage();
  }

  getTransactions() {
    let response = this.configService.getConfig();
    let records: Record[] = [];
    response.forEach((item) => {
      let dates = <Dates>{
        valueDate: item.dates.valueDate,
      };

      let AmountCurrencyCurrency = <AmountCurrency>{
        amount: item.transaction.amountCurrency.amount,
        currencyCode: item.transaction.amountCurrency.currencyCode,
      };

      let transaction = <Transaction>{
        amountCurrency: AmountCurrencyCurrency,
        type: item.transaction.type,
        creditDebitIndicator: item.transaction.creditDebitIndicator,
      };

      let merchant = <Merchant>{
        name: item.merchant.name,
        accountNumber: item.merchant.accountNumber,
      };

      let record = <Record>{
        categoryCode: item.categoryCode,
        dates: dates,
        transaction: transaction,
        merchant: merchant,
      };
      this.transact.push(record);
    });
  }

  sendMessage(): void {
    
    this.messageService.sendMessage(this.transact);
  }

  clearMessages(): void {
    
    this.messageService.clearMessages();
  }

  ngOnDestroy() {
    
    this.subscription.unsubscribe();
  }
}
