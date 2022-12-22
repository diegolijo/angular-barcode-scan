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
    <barcode-host-listener></barcode-host-listener>
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
    this.scannerProvider.scanBarcode().then((result)=>{
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
