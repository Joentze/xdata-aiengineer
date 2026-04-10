import { defineHandler } from "nitro";
import { proxyRequest } from "h3";

export default defineHandler((event) => {
  const esUrl = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
  return proxyRequest(event, esUrl + event.url.pathname, {
    headers: {
      Authorization: "Basic " + btoa("elastic:elastic"),
    },
  });
});
