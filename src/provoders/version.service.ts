import { Injectable } from '@angular/core';
import { APP_VERSION_URL } from './consts';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VersionInfo } from './type';

@Injectable()
export class VersionService  {
    constructor( private http: HttpClient){}
    /**
     * 获取服务器上App版本
     */
    getVision(): Observable<VersionInfo> {
        return this.http.get(APP_VERSION_URL).map((res: any) => {
            let obj: VersionInfo = {
                name: res.name,
                version: res.version,
                description: res.description || []
            }
            return obj;
        });
    }
}