const { TextEncoder, TextDecoder } = require("util");
Object.assign(global, { TextEncoder, TextDecoder });
if (typeof window !== 'undefined') {
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder;
}
