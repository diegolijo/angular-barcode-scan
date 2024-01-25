/* eslint-disable max-len */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

declare const cordova: any;
export interface IScanEvent {
  flag: string;
  result: any;
}
export interface ISubscriber {
  id: string;
  subscriber: any;
}
export interface IDevice {
  manufacture: string;
  model: string;
}
export interface ICameraOptions {
  preferFrontCamera?: boolean;     // iOS and Android
  showFlipCameraButton?: boolean;  // iOS and Android
  showTorchButton?: boolean;       // iOS and Android
  torchOn?: boolean;               // Android, launch with the torch switched on (if available)
  saveHistory?: boolean;           // Android, save scan history (default false)
  prompt?: string;                 // Android mensaje inferior
  resultDisplayDuration?: number;  // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
  formats?: string;                // QR_CODE,DATA_MATRIX,UPC_A,UPC_E,EAN_8,EAN_13,CODE_39,CODE_93,CODE_128,CODABAR,ITF,RSS14,PDF_417,RSS_EXPANDED,AZTEC default: all but PDF_417 and RSS_EXPANDED
  orientation?: string;            // Android only (portrait|landscape), default unset so it rotates with the device
  disableAnimations?: boolean;     // iOS
  disableSuccessBeep?: boolean;    // iOS and Android
  device?: string;
}

/**
 *  @name BarcodeScan
 *
 *  @description
 *  Servicio Angular para manejar el plugin Cordova: `bardode-scan`
 *
 *  @usage
 * ```typescript
 * app.module.ts
 *  import { BarcodeScan,  BarcodeScanModule } from 'angular-barcode-scan';
 *
 *  @NgModule({
 *   declarations: [
 *     ...
 *   ],
 *   imports: [
 *     ...
 *     BarcodeScanModule
 *   ],
 *   providers: [
 *     ...
 *     BarcodeScan
 *     ...
 *   ]
 *
 *  app.component.html
 *  <ion-app>
 *    <barcode-host-listener [debug]="true"></barcode-host-listener>
 *    ...
 *  </ion-app>
 *
 *          ---------------------------------
 *
 *  import { Device } from '@awesome-cordova-plugins/device/ngx';
 *  import { BarcodeScan } from 'angular-barcode-scanner';
 *
 *  constructor(
 *    private barcodeScan: BarcodeScan,
 *    private device: Device
 *    ) {}
 *
 *  ...
 *  await this.barcodeScan.setBarcodeDevice(this.device.model);
 *
 *  ...
 *  await this.barcodeScan.setBarcodeDevice('NQuire300');
 *  await this.barcodeScan.setBarcodeDevice(BarcodeScan.Newland);
 *
 *  ...
 *  await this.barcodeScan.clearBarcodeDevice();
 *
 *  ...
 *   this.scannerProvider.scanBarcode({disableSuccessBeep: true, showTorchButton: true,...}).then((result)=>{
 *        console.log(result);
 *   });
 *
 *  ...
 *  this.barcodeScan.subscrbeToScan(this.subscribeKey,
 *     async (value) => {
 *       this.callbackFunction(value.result);
 *     }, (err) => {
 *       console.log(err);
 *     });
 *
 *  ...
 *  this.barcodeScan.unSubscrbeToScan(this.subscribeKey);
 *
 */
@Injectable()
export class BarcodeScan {
  /**
   * flags de los eventos
   */
  public static readonly EVENT_SCAN: string = 'barcode-scanner-scan';
  public static readonly EVENT_ENABLE: string = 'barcode-scanner-enable';
  public static readonly EVENT_DISABLE: string = 'barcode-scanner-disable';
  public static readonly EVENT_GET_DEVICES: string = 'barcode-scanner-get-devices';
  public static readonly EVENT_CANCEL: string = 'barcode-scanner-cancel';

  /**
   * Fabricantes compatibles
   */

  /*
  public static readonly Chainway: string = 'c4050';
  public static readonly Newland: string = 'NQuire300';
  public static readonly Honeywell: string = 'EDA50K';
  public static readonly Zebra: string = 'ZebraMC33';
  public static readonly Unitech: string = 'UnitechEA300';
  public static readonly Unitech630: string = 'EA630';
  public static readonly ITOS: string = 'IT_51';
  public static readonly ZebraNew: string = 'TC26';
  */

  // lista de los modelos del plugin, y nuevos modelos asociados con alguno de los anteriores
  private readonly compatibleHardware: any[] = [
    // modelos del plugin
    { model: 'c4050', index: 1 },
    { model: 'NQuire300', index: 2 },
    { model: 'EDA50K', index: 3 },
    { model: 'ZebraMC33', index: 4 },
    { model: 'UnitechEA300', index: 5 },
    { model: 'EA630', index: 6 },
    { model: 'IT_51', index: 7 },
    { model: 'TC26', index: 8 },
    // modelos correlativos
    { model: 'EA300', index: 5 },
    { model: 'NQ300', index: 2 },
    { model: 'TC20', index: 4 }
  ];

  private scanSubject = new Subject<IScanEvent>();
  private subscribes: any = {};
  private hardware: IDevice = { manufacture: 'Cámara', model: 'camera' };

  constructor(
    private platform: Platform,
    private ngZone: NgZone
  ) { }

  /**
   * Selecciona el tipo de scanner de la lista de compatibles y habilita el lector dedicado.
   * Se declara un objeto Subject<IScanEvent> al que podemos suscribirnos con .subscrbeToScan(...)
   *
   * @param device posibles valores 'camera', 'c4050', 'NQuire300', 'EDA50K', 'ZebraMC33', 'UnitechEA300', 'EA630','IT_51', 'TC26'
   * o (modelos correlativos) 'EA300',  'NQ300', 'TC20'
   * @returns el dispositivo seleccionado
   */
  public async setBarcodeDevice(model: string): Promise<IDevice> {
    this.hardware = await this.getPluginModel(model);
    await this.enableScan(this.hardware.model);
    return this.hardware;
  }

  /**
   * Deshabilita el scanner seleccionado
   */
  public async clearBarcodeDevice(): Promise<boolean> {
    return await this.disableScan(this.hardware.model);
  }

  /**
   * Devuelve los fabricantes compatibles y modelos de hardware que pueden enviarse como parámetro a la función setBarcodeDevice()
   */
  public getSupportedDevices(): IDevice[] {
    return [
      { manufacture: 'Chainway', model: 'c4050' },
      { manufacture: 'Newland', model: 'NQuire300' },
      { manufacture: 'Honeywell', model: 'EDA50K' },
      { manufacture: 'Zebra', model: 'ZebraMC33' },
      { manufacture: 'ZebraTC26', model: 'TC26' },
      { manufacture: 'Unitech', model: 'UnitechEA300' },
      { manufacture: 'Unitech630', model: 'EA630' },
      { manufacture: 'ITOS', model: 'IT_51' }];
  }

  /**
   * Inicia una lectura del hardware dedicado o lanza la cámara para usarla como lector.
   * Cada vez que se produce un escaneo se propaga un Subject<IScanEvent>
   * camera options:   {
   *       preferFrontCamera : true,    // iOS and Android
   *       showFlipCameraButton : true, // iOS and Android
   *       showTorchButton : true,      // iOS and Android
   *       torchOn: true,               // Android, launch with the torch switched on (if available)
   *       saveHistory: true,           // Android, save scan history (default false)
   *       prompt : "mensaje inferior", // Android
   *       resultDisplayDuration: 500,  // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
   *       formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
   *       orientation : "landscape",   // Android only (portrait|landscape), default unset so it rotates with the device
   *       disableAnimations : true,    // iOS
   *       disableSuccessBeep: false    // iOS and Android
   *   }
   *
   * @returns la lectura del scanner
   */
  public async scanBarcode(options?: ICameraOptions): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (options) {
          options.device = this.hardware.model;
        }
        const value = await this.scan(options || this.hardware.model);
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }


  public async launchAndroidSettings(param: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const value = await this.launchSettings(param);
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }


  /**
   * Reproduce el archivo especificado por parámetro
   *
   * @param filePath la ruta bajo la carpeta assets. ej: 'audio/beep.mp3'
   * @param callbackFunction
   * @param errorFunction
   */
  public async play(filePath: string, volune: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const value = await this.nativePlay(filePath, volune);
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Declara un nuevo observable para escuchar los eventos del scanner
   *
   * @param id id único para declarar el observable.
   * Si el id fue utilizado anteriormente y la suscripción aun está activa se aborta la operación
   * @param callbackFunction
   * @param errorFunction
   */
  public subscrbeToScan(id: string, callbackFunction: any, errorFunction: any): void {
    try {
      const element = this.subscribes[id];
      let subscriber: any;
      if (!element || (element.key === id && element.subscriber.closed)) {
        subscriber = this.scanSubject.asObservable().subscribe((value) => {
          this.ngZone.run(() => {
            callbackFunction(value);
          });
        });
        this.subscribes[id] = {
          subscriber: subscriber,
          key: id
        };
      }
    } catch (err) {
      errorFunction(err);
    }
  }

  /**
   * Se cierra el subscribe declarado con el id proporcionado
   *
   * @param id id del observable para cancelar la suscripción
   */
  public unSubscrbeToScan(id: string): void {
    if (this.subscribes[id] && !this.subscribes[id].subscriber.closed) {
      this.subscribes[id].subscriber.unsubscribe();
      delete this.subscribes[id];
    };
  }

  /***************************************** llamadas al plugin *********************************************/
  private async getPluginModel(nativeModel: string): Promise<IDevice> {
    await this.platform.ready();
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.platform.is('cordova')) {
          const msg = 'Scanner plugin not available';
          reject(msg);
        }
        if (this.platform.is('cordova')) {
          let model = 0; // TODO comprobar que el dispositivo tiene camara
          const pluginDevices: any = await this.getDevices();
          const result = this.compatibleHardware.find(element => element.model === nativeModel);
          if (result) {
            model = result.index;
          }
          const hardware: IDevice = this.getSupportedDevices().find(device => device.model === pluginDevices[model])
            || { manufacture: 'Cámara', model: 'camera' };
          resolve(hardware);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  private getDevices(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (this.platform.is('cordova')) {
        cordova.plugins.BarcodeScan.getDevices((res: any) => {
          console.log('%c getDevices: ' + JSON.stringify(res), 'color:orange');
          this.scanSubject.next({ flag: BarcodeScan.EVENT_GET_DEVICES, result: res });
          resolve(res);
        }, (err: any) => {
          reject(err);
        });
      }
    });
  }

  private enableScan(model: any): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (this.platform.is('cordova')) {
        cordova.plugins.BarcodeScan.enable(model, (value: any) => {
          console.log('%c enableScan: ' + JSON.stringify(value), 'color:purple');
          if (model !== 'camera' && value.text) {
            this.scanSubject.next({ flag: BarcodeScan.EVENT_ENABLE, result: value.text });
            this.scanSubject.next({ flag: BarcodeScan.EVENT_SCAN, result: value.text });
          }
          resolve(true);
        }, (err: any) => {
          reject(err);
        });
      }
    });
  }

  private disableScan(model: any): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (model) {
        cordova.plugins.BarcodeScan.enable(model, (res: any) => {
          this.scanSubject.next({ flag: BarcodeScan.EVENT_DISABLE, result: res });
          resolve(true);
        }, (err: any) => {
          reject(err);
        });
      } else {
        resolve(true);
      }
    });
  }

  private scan(model: any): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (this.platform.is('cordova')) {
        cordova.plugins.BarcodeScan.scan(model, (value: any) => {
          console.log('%c Scan: ' + JSON.stringify(value), 'color:green');
          if (value.text) {
            this.scanSubject.next({ flag: BarcodeScan.EVENT_SCAN, result: value.text });
          } else if (value.cancelled) {
            this.scanSubject.next({ flag: BarcodeScan.EVENT_CANCEL, result: null });
          }
          resolve(value.text);
        }, (err: any) => {
          reject(err);
        });
      }
    });
  }

  private nativePlay(filepath: string, volune: number): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (this.platform.is('cordova')) {
        cordova.plugins.BarcodeScan.play(filepath, volune, (value: any) => {
          resolve(value);
        }, (err: any) => {
          reject(err);
        });
      }
    });
  }


  private launchSettings(param: string): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      if (!this.platform.is('cordova')) {
        const msg = 'Scanner plugin not available';
        reject(msg);
      }
      if (this.platform.is('cordova')) {
        cordova.plugins.BarcodeScan.launchAndroidSettings(param, (value: any) => {
          resolve(value);
        }, (err: any) => {
          reject(err);
        });
      }
    });
  }


}
