// React Testing Library setup
require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require("util");
Object.assign(global, { TextEncoder, TextDecoder });
if (typeof window !== "undefined") {
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
}
console.log("Jest setup loaded, TextEncoder set:", !!global.TextEncoder);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
