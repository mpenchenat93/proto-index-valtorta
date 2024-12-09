import * as CryptoJS from 'crypto-js';

export class EncryptionService {
  private static secretKey =
    '9f8d8c49d25e3b2c3d161de155b0c24a3b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e';

  constructor() {}

  static encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  static decrypt(textToDecrypt: string) {
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(
      CryptoJS.enc.Utf8
    );
  }
}
