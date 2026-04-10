import { defineHandler } from "nitro";
import { proxyRequest } from "h3";

export default defineHandler((event) => {
  return proxyRequest(event, "http://localhost:9200" + event.url.pathname, {
    headers: {
      Authorization: "Basic " + btoa("elastic:elastic"),
    },
  });
});
