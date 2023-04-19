declare module "json-cycle" {
  export function decycle(object: any, replacer?: (key: string, value: any) => any, depth?: number): any;
  export function retrocycle($: any): any;
}
