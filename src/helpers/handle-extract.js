import Promise from "bluebird";
import CSVStream from "csv-stream";
import JSONStream from "JSONStream";
import requestClient from "request";
import ps from "promise-streams";
import BatchStream from "batch-stream";
import _ from "lodash";

/**
 * @param {Object} body Request Body Object
 * @param {Object} batchSize
 * @param {Function} callback returning a Promise
 * @return {Promise}
 *
 * return handleExtract(req, 100, (users) => Promise.resolve())
 */
export default function handleExtract(ctx, { body, batchSize, handler, onResponse, onError }) {
  const { logger } = ctx.client;
  const { url, format } = body;
  if (!url) return Promise.reject(new Error("Missing URL"));
  const decoder = format === "csv" ? CSVStream.createStream({ escapeChar: "\"", enclosedChar: "\"" }) : JSONStream.parse();

  const batch = new BatchStream({ size: batchSize });

  return requestClient({ url })
    .on("response", (response) => {
      if (_.isFunction(onResponse)) {
        onResponse(response);
      }
    })
    .on("error", (error) => {
      if (_.isFunction(onError)) {
        onError(error);
      }
    })
    .pipe(decoder)
    .pipe(batch)
    .pipe(ps.map({ concurrent: 2 }, (...args) => {
      try {
        return handler(...args);
      } catch (e) {
        logger.error("ExtractAgent.handleExtract.error", e.stack || e);
        return Promise.reject(e);
      }
    }))
    .promise()
    .then(() => true);
}