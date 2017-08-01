import { Injectable } from '@angular/core';

/**
 * hack to be able to use chrome API
**/
declare var chrome: any;

@Injectable()
export class ConfigurationService {

  constructor() { }

  public getOptionValue(key: Keys) : Promise<any> {
    return new Promise<any>( function(resolve, reject) {
      chrome.storage.sync.get( key, (items) => {
        console.debug(`option ${key} have value ${JSON.stringify(items)}`);
        resolve(items[key]);
      });
    });
  }

  public saveOptionValue(key: Keys, value: any) : Promise<void> {
    return new Promise<void>( function(resolve, reject) {
      let obj: Object = new Object();
      obj[key] = value;
      chrome.storage.sync.set( obj , function() {
        console.debug(`option saves : ${JSON.stringify(obj)}`);
        resolve();
      });
    });
  }
}

type Keys = "redmineAPIKey"
