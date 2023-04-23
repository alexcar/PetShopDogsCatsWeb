import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { Component } from '@angular/core';
import { DialogDataComponent } from 'src/app/shared/dialog-data/dialog-data.component';
import { Employee } from './../../domain/employee';
import { ListProduct } from 'src/app/interfaces/listProduct';
import { ListSupplier } from 'src/app/interfaces/listSupplier';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from 'src/app/domain/product';
import { ProductCodeEntry } from 'src/app/domain/product-code-entry';
// import { ProductCodeEntry } from 'src/app/interfaces/productCodeEntry';
import { ProductEntryHeader } from 'src/app/domain/product-entry-header';
import { ProductEntryService } from 'src/app/services/product-entry.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackBarComponent } from 'src/app/shared/snack-bar/snack-bar.component';
import { SupplierService } from 'src/app/services/supplier.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-stock-receipt',
  templateUrl: './stock-receipt.component.html',
  styleUrls: ['./stock-receipt.component.css']
})
export class StockReceiptComponent {

  id: string | null = null;
  submitted = false;
  action = '';
  productEntryHeaderForm!: FormGroup;
  productEntryHeader = new ProductEntryHeader();
  product!: Product;
  showSpinner = false;
  suppliers: ListSupplier[] = [];
  selectedSupplier: string | null = null;

  displayedColumns: string[] = ['code', 'name', 'costValue', 'quantity', 'subTotal'];
  dataSource: any;
  listProductEntry: Product[] = [];
  timeout: any = null;
  // productCodeEntry?: ProductCodeEntry;
  productCodeEntry = new ProductCodeEntry()

  quantity = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productEntryService: ProductEntryService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getSuppliers();

    this.id = this.route.snapshot.paramMap.get('id');
    this.createForm(this.id);

    if (this.id == null) {
      this.action = "Adicionar";
    } else {
      this.action = "Editar";
    }

    // this.manageForm();
  }

  getSuppliers(): void {
    this.supplierService.getListSupplier()
      .subscribe({
        next: (result) => {
          this.suppliers = result;
        },
        error: (error) => {
          let errorMessages: string[] = [];
          errorMessages = error.message.split('|');
          let duration: number = 5000;

          let config = new MatSnackBarConfig();
          config.duration = duration;
          config.data = error.message.split('|')
          config.panelClass = ["red-snackbar"];
          config.horizontalPosition = 'center';
          config.verticalPosition = 'top';

          let configError: MatSnackBarConfig = {
            panelClass: 'red-snackbar',
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          };

          this.snackBar.openFromComponent(SnackBarComponent, {
            data: error.message.split('|'),
            ...configError
           });

          return of([])
        },
        complete: () => {
          // this.showSpinner = false;
        }
      });
  }

  createForm(id: string | null): void {
    this.productEntryHeader = new ProductEntryHeader();
    this.productEntryHeader.employeeId = 'FF64CC2C-8489-4116-3899-08DB3C30BAF7';
    this.productEntryHeader.active = true;

    if (id != null) {
      this.updateForm(id);
    }

    this.productEntryHeaderForm = this.fb.group({
      id: [this.productEntryHeader.id],
      code: [this.productEntryHeader.code, Validators.required],
      supplierId: [this.productEntryHeader.suppliedId, Validators.required],
      employeeId: [this.productEntryHeader.employeeId],
      active: [this.productEntryHeader.active]
    });
  }

  get f() { return this.productEntryHeaderForm; }

  updateForm(id: string): void {
    this.showSpinner = true;

    this.productEntryService.getProductEntryHeaderById(id)
      .subscribe({
        next: (result) => {
          this.productEntryHeaderForm.patchValue(result);
          this.selectedSupplier = result.suppliedId;
        },
        error: (error) => {
          this.showSpinner = false;

          let configError: MatSnackBarConfig = {
            panelClass: 'red-snackbar',
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          };

          this.snackBar.openFromComponent(SnackBarComponent, {
            data: error.message.split('|'),
            ...configError
           });

           return of([])
        },
        complete: () => {
          this.showSpinner = false;
        }
      });
  }

  onSubmit(): void {

  }

  manageForm(): void {

  }

  disabledAddButton(): boolean {
    return (this.productCodeEntry.code == undefined || this.productCodeEntry.code == '') ||
    (this.productCodeEntry.costValue == undefined || this.productCodeEntry.costValue == null || this.productCodeEntry.costValue == 0) ||
    (this.productCodeEntry.quantity == undefined || this.productCodeEntry.quantity == null || this.productCodeEntry.quantity == 0);


    // criar variáveis code e costValue paa ser usado com o [(ngModel)]
    // habilitar ou não o botão Adicionar a partir das variáveis quantity, code e costValue.
    // se apagar o campo code, limpar os campos referente ao produto pesquisado
    // buscar o produto no database quando digitar o código.
    // inserir e escluir os produtos na lista de produtos.
    // gravar a entrada de produto no database.
  }

  searchProductByCode(event: any): void {
    clearTimeout(this.timeout);
    var $this = this;

    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        // $this.executeListen(event.target.value);
        $this.getProductByCode(event.target.value);
      }
    }, 1000);
  }

  private executeListen(value: string): void {
    if (value == '') {
      this.productCodeEntry = new ProductCodeEntry();
      return;
    }

    alert(value);
  }

  getProductByCode(code: string): void  {
    if (code == '') {
      this.productCodeEntry = new ProductCodeEntry();
      return;
    }

    this.showSpinner = true;

    this.productService.getProductByCode(code)
      .subscribe({
        next: (result) => {
          this.productCodeEntry = result;
        },
        error: (error) => {
          this.showSpinner = false;
          this.productCodeEntry = new ProductCodeEntry();

          let configError: MatSnackBarConfig = {
            panelClass: 'red-snackbar',
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          };

          this.snackBar.openFromComponent(SnackBarComponent, {
            data: error.message.split('|'),
            ...configError
           });

           return of([])
        },
        complete: () => {
          this.showSpinner = false;
        }
      }
    );
  }

  addProduct(product: Product): void {
    this.listProductEntry.push(product);
    this.dataSource = new MatTableDataSource(this.listProductEntry);
  }

  removeProduct(product: Product): void {
    const dialogRef = this.dialog.open(DialogDataComponent, {
      data: {
        message: `Confirma a exclusão do produto ${product.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe( result => {
      if (result === true) {
        this.dataSource = this.listProductEntry.filter((value, key) => {
          return value.id != product.id;
        });

        this.listProductEntry = this.listProductEntry.filter((value, key) => {
          return value.id != product.id;
        });

        this.dataSource = new MatTableDataSource(this.listProductEntry)
      }
    });
  }
}
