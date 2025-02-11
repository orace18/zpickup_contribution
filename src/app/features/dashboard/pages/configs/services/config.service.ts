import { Injectable } from "@angular/core"
import { environment } from "../../../../../../environments/environment"
import { HttpClient } from "@angular/common/http";
import { Config } from "../models/config.model";

@Injectable({
    providedIn: 'root'
  })
export class ConfigService {
    private apiUrl = environment.apiUrl + "/configs";
    constructor(private http: HttpClient){}

    getConfig() {
        return this.http.get<Config>(this.apiUrl);
    }

}