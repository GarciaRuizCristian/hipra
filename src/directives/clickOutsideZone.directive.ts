import { Directive, ElementRef, Input, Renderer ,NgZone} from '@angular/core';
import { MenuController } from 'ionic-angular';

@Directive({ selector: '[clickOutsideZone]' })
export class clickOutsideZoneDirective {
    constructor(private el: ElementRef, renderer: Renderer, ngZ: NgZone, public menuCtrl: MenuController) {
	ngZ.runOutsideAngular(() => {     
      
      renderer.listen(this.el.nativeElement, 'click', (event) => {
		console.log("Event");
		this.menuCtrl.open();
		
      })
      
    });
      
    }
}
