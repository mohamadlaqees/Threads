// import { createRouteHandler } from "uploadthing/server";

// import { ourFileRouter } from "./core";

// // Export routes for Next App Router
// const handlers = createRouteHandler({
//   router: ourFileRouter,
//   config: {
//     token: process.env.UPLOADTHING_TOKEN,
//   },
// });

// export { handlers as GET, handlers as POST };

import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },


});
