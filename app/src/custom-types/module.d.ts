declare global {
  namespace Express {
    export interface User {
      userId: number;
    }
  }
}
export {};
