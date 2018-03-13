import { TranslateService } from 'ng2-translate/src/translate.service';
import { GoogleMapsLatLng } from 'ionic-native/dist/es5';
import { GeocoderProvider } from '../../providers/geocoder-provider';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;
declare var MarkerClusterer: any;

@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  markers: Array<any>;

  location: boolean = false;

  hasBeenLoaded: boolean = false;

  partner_markers: Array<{
    latitude: string,
    longitude: string,
    partner_name: string,
    partner_address: string
  }>

  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    //private geocoderProvider: GeocoderProvider,
    private navParams: NavParams,
    private translate: TranslateService
  ) {

  }

  ionViewDidLoad() {
    this.partner_markers = this.navParams.get("partner_markers");
    this.location = this.navParams.get("location");
    this.initMap();
  }

  initMap() {

    if (this.location) {

      let locationOptions = {timeout: 10000, enableHighAccuracy: true};

      this.geolocation.getCurrentPosition(locationOptions).then((position) => {

        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          //maxZoom: 15,
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.initMarkers();

      }, (err) => {
        let mapOptions;

        if (this.partner_markers.length > 0) {

          let latLng = new google.maps.LatLng(this.partner_markers[0].latitude, this.partner_markers[0].longitude);

          mapOptions = {
            //maxZoom: 15,
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }

        } else {

          let latLng = new google.maps.LatLng(0, 0);

          mapOptions = {
            //maxZoom: 15,
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        this.initMarkers();
      });

    } else {

      let mapOptions;

      if (this.partner_markers.length > 0) {

        let latLng = new google.maps.LatLng(this.partner_markers[0].latitude, this.partner_markers[0].longitude);

        mapOptions = {
          //maxZoom: 15,
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

      } else {

        let latLng = new google.maps.LatLng(0, 0);

        mapOptions = {
          //maxZoom: 15,
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.initMarkers();

    }
  }

  initMarkers() {

    this.markers = [];

    for (let partner_marker of this.partner_markers) {

      let latLng = new google.maps.LatLng(partner_marker.latitude, partner_marker.longitude);

      this.addMarker(latLng, partner_marker.partner_name, partner_marker.partner_address);

    }

    let markerCluster = new MarkerClusterer(this.map, this.markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

    this.hasBeenLoaded = true;

  }

  pinSymbol(color) {
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000',
      strokeWeight: 2,
      scale: 1,
    };
  }

  addMarker(latlng: GoogleMapsLatLng, partner_name: string, partner_address: string) {


    let marker = new google.maps.Marker({
      position: latlng,
      icon: this.pinSymbol("#6CC14A"),
    });

    this.markers.push(marker);

    let content = `<div class="marker-info"><h4 class="name">${partner_name}</h4><h4 class="address">${partner_address}</h4><div>`;

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content,
      color: '#000'
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

}