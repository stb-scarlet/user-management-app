// =====================================================================
// Local development entry point.
//
// note: run this with `node index.js` (or `npm run dev`) when working
// on your own machine. For Vercel, api/index.js is used instead — it
// exports the same app WITHOUT calling .listen().
// =====================================================================

const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
