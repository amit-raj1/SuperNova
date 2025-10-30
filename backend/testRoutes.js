// Quick test to verify routes are registered
const app = require('./server');

console.log('\n📋 Registered Routes:');
console.log('===================');

app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = handler.route.path;
        const method = Object.keys(handler.route.methods)[0].toUpperCase();
        console.log(`${method} ${middleware.regexp} ${path}`);
      }
    });
  }
});

console.log('\n✅ Route registration check complete\n');
