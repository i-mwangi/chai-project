declare module 'express' {
  import http = require('http');
  export type Request = http.IncomingMessage & { body?: any; params?: any; query?: any; headers?: any };
  export type Response = http.ServerResponse & { json?: (body: any) => void; status?: (code: number) => any };
  const express: any;
  export default express;
  export function Router(): any;
}
