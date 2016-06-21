import NotifHandler from "./notif-handler";
import BatchHandler from "./batch-handler";
import hullClient from "./middleware/client";
import Client from "./client";

import Readme from "./route/readme";
import Manifest from "./route/manifest";
import OAuth from "./route/oauth";

Client.NotifHandler = NotifHandler;
Client.BatchHandler = BatchHandler;

Client.Routes = {
  Readme,
  OAuth,
  Manifest
};
Client.Middlewares = {
  hullClient: hullClient.bind(undefined, Client)
};
module.exports = Client;
