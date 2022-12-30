# angular-barcode-scan
Servicio Angular para manejar el plugin Cordova: `bardode-scan`

## install 

 ```
 $ ionic cordova plugin add barcode-scan
 $ npm install angular-barcode-scan
 ```

 ```Angular
 app.module.ts:
  import { BarcodeScan,  BarcodeScanModule } from 'angular-barcode-scan';
  
   @NgModule({
    declarations: [
      ...
    ],
    imports: [
      ...
      BarcodeScanModule
    ],
    providers: [
      ...
      BarcodeScan
      ...
    ],
   })

  app.component.html:
   <ion-app>
    <barcode-host-listener [debug]="true"></barcode-host-listener>
   ...
   </ion-app>

  ```
 ## Usage

    import { Device } from '@awesome-cordova-plugins/device/ngx';
    import { BarcodeScan } from 'angular-barcode-scanner';
  
    constructor(
      private barcodeScan: BarcodeScan,
      private device: Device
      ) {}
  
    ...
    await this.barcodeScan.setBarcodeDevice(this.device.model);
  
    ...
    await this.barcodeScan.setBarcodeDevice('NQuire300');
    await this.barcodeScan.setBarcodeDevice(BarcodeScan.Newland);
  
    ...
    await this.barcodeScan.clearBarcodeDevice();
  
    ...
    ICameraOptions {
                    preferFrontCamera?: boolean;     
                    showFlipCameraButton?: boolean;  
                    showTorchButton?: boolean;       
                    torchOn?: boolean;               // launch with the torch switched on (if available)
                    saveHistory?: boolean;           // save scan history (default false)
                    prompt?: string;                 // Android mensaje inferior
                    resultDisplayDuration?: number;  // display scanned text for X ms. 0 suppresses it entirely, default 1500
                    formats?: string;                // QR_CODE, DATA_MATRIX, UPC_A, UPC_E, EAN_8, EAN_13, CODE_39, CODE_93, CODE_128, CODABAR, ITF, RSS14, PDF_417, RSS_EXPANDED, AZTEC default: all but PDF_417 and RSS_EXPANDED
                    orientation?: string;            // portrait | landscape, default unset so it rotates with the device
                    disableSuccessBeep?: boolean;    
                    device?: string;
                  }

    this.scannerProvider.scanBarcode(Options?).then((result)=>{
         console.log(result);
      });
 
    ...
    this.barcodeScan.subscrbeToScan(this.subscribeKey,
       async (value) => {
         this.callbackFunction(value.result);
       }, (err) => {
         console.log(err);
       });
  
    ...
    this.barcodeScan.unSubscrbeToScan(this.subscribeKey);
    

## Supported platforms

- Android
