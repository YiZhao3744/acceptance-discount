import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BASEURL, REQUEST_TIMEOUT } from "./consts";
import { retry, timeout } from 'rxjs/operators';
import { Injectable } from "@angular/core";

@Injectable()
export class HttpService  {
    constructor( private http: HttpClient) {
    }

    get(url: string, params: any) {
        let headers = new HttpHeaders();
        headers = headers.set('token','string');
        return this.http.get(BASEURL + url, { headers, params })
        .pipe(
            retry(5),
            timeout(REQUEST_TIMEOUT)
        )
    }

    post(url: string, params: any) {
        let headers = new HttpHeaders();
        headers = headers.set('token','string');
        return this.http.post(BASEURL + url, params, {headers} )
        .pipe(
            retry(5),
            timeout(REQUEST_TIMEOUT)
        )
    }
}