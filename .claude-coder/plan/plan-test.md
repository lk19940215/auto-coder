# Plan: Create Hello World Function

## Context
User requests creating a "hello world" function in a Node.js/JavaScript project.

## Implementation

Create a new file `src/hello.js` with a simple hello world function:

```javascript
/**
 * Returns a hello world greeting
 * @param {string} name - Optional name to greet
 * @returns {string} Hello world greeting
 */
function helloWorld(name = 'World') {
  return `Hello, ${name}!`;
}

module.exports = { helloWorld };
```

## Files to Create
- `src/hello.js` - New file containing the hello world function

## Verification
Run the following to test:
```bash
node -e "const { helloWorld } = require('./src/hello.js'); console.log(helloWorld());"
```
Expected output: `Hello, World!`