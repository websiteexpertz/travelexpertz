declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank";
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<unknown>;
  }

  export function load(options: { mode: "sandbox" | "production" }): Promise<CashfreeInstance | null>;
}
