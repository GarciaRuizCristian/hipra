import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class GeocoderProvider {

    private stackCount = 0;

    constructor( private http: Http) {

    }

    public geocodeAddress(address: string, postal_code?: string, town?: string, country?: string){
        let outputFormat = "json";
        let parameters = `address=${address}`;
        if(postal_code != null && postal_code != "")
            parameters += `,${postal_code}`;
        if(town != null && town != "")
            parameters += `,${town}`;
        if(country != null && country != "")
            parameters += `,${country}`;

        let url = `https://maps.googleapis.com/maps/api/geocode/${outputFormat}?${parameters}`;

        return new Promise((resolve,reject) => {
            this.http.get(url)
                    .toPromise()
                    .then(
                        res => {
                            if(res.json().status == "OK")
                                resolve(res.json().results[0].geometry.location);
                            if(res.json().status == "ZERO_RESULTS")
                                reject("GeocodeNotFound");
                            reject("GeocodeError");
                        },
                        msg => {
                            reject("GeocodeError")
                        }
                    )
        })
    }
}