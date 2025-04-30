const ErrorResponse = require('../../../src/utils/errorResponse.js');

describe('ErrorResponse class', () => {
  test('Should set message and statusCode correctly', () => {
    const err = new ErrorResponse('Not found', 404);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ErrorResponse);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('Error');
  });
});
