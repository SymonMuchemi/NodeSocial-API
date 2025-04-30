const mockConnect = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn();

module.exports = {
  createClient: jest.fn(() => ({
    connect: mockConnect,
    get: mockGet,
    set: mockSet,
    isReady: true, // Simulate connected state
  })),
};
