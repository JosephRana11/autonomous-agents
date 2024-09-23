import { bech32 } from "bech32";

export function convertToHexIfBech32(address: string): string {
  if (address.includes('stake')){
    const decoded = bech32.decode(address);
    const data = bech32.fromWords(decoded.words);
    return Buffer.from(data).toString('hex');
  }
  return address
}

export function isHexValue(value:string):boolean{
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(value);
}

export function validateAddress(value: string): boolean {
  if (isHexValue(value)){
    return value.length === 56 || value.length === 58
  }
  return false
}