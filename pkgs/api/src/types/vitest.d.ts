/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
interface CustomMatchers<TR = unknown> {
  toBeIsoDate: () => TR;
}

declare namespace Vi {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
  interface ExpectStatic extends CustomMatchers {}
}
