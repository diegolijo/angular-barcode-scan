/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/component-selector */
import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'barcode-host-listener',
  template: ``,
  styles: [
  ]
})
export class BarcodeHostListener {


  private static readonly KEYDOWN_EVENT = 'document:keydown';
  private static readonly KEYUP_EVENT = 'document:keyup';
  private static readonly KEYPRESS_EVENT = 'document:keypress';

  @Input() debug: boolean | undefined;

  constructor() {
  }


  @HostListener(BarcodeHostListener.KEYUP_EVENT, ['$event']) handleKeyboardEventKeyUp(event: KeyboardEvent) {
    if (this.debug) {
      console.log('%cKeyboard ' + BarcodeHostListener.KEYUP_EVENT + ' event: ' + event.keyCode, 'color:orange');
    }
    return false; //prevent event to be fired repeteadly in devices with physical keyboard (android 5 -> unitech)
  };

  @HostListener(BarcodeHostListener.KEYPRESS_EVENT, ['$event']) handleKeyboardEventKeypress(event: KeyboardEvent) {
    if (this.debug) {
      console.log('%cKeyboard ' + BarcodeHostListener.KEYPRESS_EVENT + ' event: ' + event.keyCode, 'color:orange');
    }
  };


  @HostListener(BarcodeHostListener.KEYDOWN_EVENT, ['$event']) handleKeyboardEventKeydown(event: KeyboardEvent) {
    if (this.debug) {
      console.log('%cKeyboard ' + BarcodeHostListener.KEYDOWN_EVENT + ' event: ' + event.keyCode, 'color:orange');
    }
    const src: any = event.srcElement;
    const isPhysicalKeyboard = !src.type; //!src.type -> event from physycal keyboard without input focused
    const isInputNumberType = (src && src.type && src.type.indexOf(['number']) >= 0); //event for input type=number and focused
    //let isNumberKeyCode = event.keyCode >= 48 && event.keyCode<= 57;
    if (isPhysicalKeyboard || isInputNumberType) {
      //prevent event to be fired repeteadly in devices with physical keyboard (android 5-> unitech)
      event.preventDefault();
    }
    // TODO  this.events.publish(Constants.KEYDOWN_EVENT, event);
    if (isPhysicalKeyboard || isInputNumberType) {
      //prevent event to be fired repeteadly in devices with physical keyboard (android 5-> unitech)
      return false; //return false to prevent event bubble up
    }
    return true;
  }


}
