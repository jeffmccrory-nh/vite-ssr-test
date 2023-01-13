import express from "express";
import compression from "compression";
import { renderPage } from "vite-plugin-ssr";
import { root } from "./root.js";
import pkg from '@okta/oidc-middleware';
const { ExpressOIDC } = pkg;
import session from "cookie-session";
const isProduction = process.env.NODE_ENV === "production";
import * as dotenv from 'dotenv';
dotenv.config();
startServer();

async function startServer() {
  const app = express();

  app.use(compression());

  if (isProduction) {
    const sirv = (await import("sirv")).default;
    app.use(sirv(`${root}/dist/client`));
  } else {
    const vite = await import("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  const oidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_DOMAIN}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_SECRET,
    appBaseUrl: process.env.OKTA_APP_DOMAIN,
    scope: "openid profile",
  });

  oidc.on("ready", async () => {
    app.use(
      session({
        secret: "this-should-be-very-random",
        // secure: !!isProduction, // this isn't working on the portal
      })
    );

    app.use(oidc.router);
    app.use(compression());

    app.get('/logout', oidc.forceLogoutAndRevoke());

    app.get("*", oidc.ensureAuthenticated(), async (req, res, next) => {
      const pageContextInit = {
        urlOriginal: req.originalUrl,
        user : req.userContext.userinfo
      };
      const pageContext = await renderPage(pageContextInit);
      const { httpResponse } = pageContext;
      if (!httpResponse) return next();
      const { body, statusCode, contentType, earlyHints } = httpResponse;
      if (res.writeEarlyHints)
        res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) });
      res.status(statusCode).type(contentType).send(body);
    });

    const port = process.env.PORT || 3000;
    app.listen(port);
    console.log(`Server running at http://localhost:${port}`);
  });
}
