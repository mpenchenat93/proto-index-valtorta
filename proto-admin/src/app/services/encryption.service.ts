import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private secretKey =
    '9f8d8c49d25e3b2c3d161de155b0c24a3b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e';

  constructor() {}

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(textToDecrypt: string) {
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(
      CryptoJS.enc.Utf8
    );
  }
}
