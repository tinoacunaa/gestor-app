// Hostinger ejecuta este archivo directamente (no usa "npm start" como Vercel).
// Next.js necesita este pequeño servidor propio para escuchar en el puerto
// que Hostinger le asigna a la app.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Gestor corriendo en el puerto ${port}`);
  });
});
