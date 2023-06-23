import type { ResValidationError } from '../../types/api/index.js';

export class AuthError extends Error {
  err: ResValidationError;

  constructor(field: string, code: string, message: string) {
    super(code);

    this.err = {
      error: {
        code: 'validation_error',
        form: [],
        fields: { [field]: { code, message, path: [] } },
      },
    };
  }
}
