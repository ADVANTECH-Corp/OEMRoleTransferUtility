/*
 * To run this TypeScript example say:
 *
 * MBED_CLOUD_DEVICE_SERVER_API=https://your-mbedcloud-api MBED_CLOUD_API_KEY=ak_your_api_key MBED_DEVICE_IDS_TO_WRITE=deviceId1,deviceId2 npm start
 *
 */

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as url from 'url';
import * as Promise from 'bluebird';
import * as ngrok from 'ngrok';
import * as fs from 'fs';
import { Logger, transports } from 'winston';
import { ConnectApi, DeviceDirectoryApi } from 'mbed-cloud-sdk';
import { resolve } from 'dns';

//require('dotenv').config({ silent: true });

const MBED_DEVICE_IDS_TO_WRITE: Array<string> =
  process.env.MBED_DEVICE_IDS_TO_WRITE && process.env.MBED_DEVICE_IDS_TO_WRITE.split(',') || [];

const uris = [
  {uri: '/30000/0/1',   payload_type: 'string', payload: process.env.SW_MANUFACTURER},                                       //SW_Manufacturer
  {uri: '/30000/0/2',   payload_type: 'string', payload: process.env.SW_MODEL_NUMBER},                               //SW_Model_Number
  {uri: '/30000/0/3',   payload_type: 'string', payload: process.env.SW_DEVICE_TYPE},                                //SW_Device_Type
  {uri: '/30000/0/4',   payload_type: 'binary', path: process.env.VENDER_ID},                 //Vendor_Id
  {uri: '/30000/0/5',   payload_type: 'binary', path: process.env.CLASS_ID},                  //Class_Id
  {uri: '/30000/0/6',   payload_type: 'binary', path: process.env.UPDATE_AUTH_CERT},//Update_Auth_Cert
  {uri: '/30000/0/7',   payload_type: 'string', payload: process.env.ENABLE_OEM_ROLE_CLAIM},                                                    //Enable_Oem_Role_Claim
  {uri: '/30000/0/8',   payload_type: 'string', payload: process.env.MIN_FW_VESION_MONOTONIC_COUNTER}                                            //Min_FW_Version_Monotonic_Counter in Epoch timestamp format. In this example, it is 2018 Jan. 1st 0:00 GMT
];

const MBED_DEVICE_RESOURCE_URIS_TO_EXECUTE: Array<string> = [
  '/30000/0/9'          //Apply_Oem_Role_Claim, give an empty post to trigger OEM role claim once all OEM Role Claim resource object is properly prepared
];

const MBED_CLOUD_API_KEY: string = process.env.MBED_CLOUD_API_KEY;
const MBED_CLOUD_DEVICE_SERVER_API: string = process.env.MBED_CLOUD_DEVICE_SERVER_API;
const POLL_MODE: boolean = false;
const NOTIFICATION_SERVER_PORT: number = 8000;
const NOTIFICATION_PATH: string = '/api/notifications';
let connectApi: ConnectApi;
let deviceDirectoryApi: DeviceDirectoryApi;
let app: express.Express;
const logger = new Logger({transports: [new transports.Console({'timestamp': true})]});


function createConnectApi(): ConnectApi {
  const connectApi =  new ConnectApi({host: MBED_CLOUD_DEVICE_SERVER_API, apiKey: MBED_CLOUD_API_KEY});
  return connectApi;
}

function createDeviceDirectoryApi(): DeviceDirectoryApi {
  const deviceDirectoryApi =  new DeviceDirectoryApi({host: MBED_CLOUD_DEVICE_SERVER_API, apiKey: MBED_CLOUD_API_KEY});
  return deviceDirectoryApi;
}

function createServer(): express.Express {
  // Create express server to listen for incoming notifications
  const app = express();
  app.use(bodyParser.json({limit: '1mb'}));
  app.use(bodyParser.urlencoded({extended: false, limit: '1mb'}));
  const server = http.createServer(app);
  server.listen(NOTIFICATION_SERVER_PORT);
  return app;
}

function initCallbackChannel(): PromiseLike<void> {
  // Tunnel device server push notifications towards devel server possibly placed behind a firewall
  return ngrok.connect({proto: 'http', addr: NOTIFICATION_SERVER_PORT})
    .then((host: string) => {
      const router = express.Router();
      router.route(NOTIFICATION_PATH).put((req, res) => {
        connectApi.notify(req.body);
        res.sendStatus(200);
      });
      app.use(router);
      const noticationUrl = url.resolve(host, NOTIFICATION_PATH);
      return connectApi.updateWebhook(noticationUrl, undefined, true);
    });
}

function notificationCallback(notification: any) {
  logger.info(`Rx notification\n ${JSON.stringify(notification, undefined, 2)}`);
}

function bindCallbackChannel(): PromiseLike<any> {
  app = createServer();
  return initCallbackChannel()
  .then(() => {
    connectApi.on(ConnectApi.EVENT_NOTIFICATION, notificationCallback);
    logger.info('External callback setup done.');
  });
}

function startPolling() {
  return connectApi.startNotifications({forceClear: true, interval: 1000, requestCallback: notificationCallback})
  .then(() => {
    logger.info('Mbed Cloud SDK listening for notifications.');
  })
  .catch((error) => {
    logger.error(error);
  });
}

function checkDevice(deviceId: string): PromiseLike<any> {
  return deviceDirectoryApi.getDevice(deviceId)
  .then((device) => {
    if (device) {
      logger.info(`Device ${deviceId} was found`);
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(`No such device: ${deviceId}`));
    }
  })
  .catch((error) => {
    return Promise.reject(error);
  });
}

function checkDevices(): Promise<any> {
  return Promise.map(MBED_DEVICE_IDS_TO_WRITE, (deviceId: string) => checkDevice(deviceId),  {concurrency: 1})
}

function readFile(path: string): Buffer {
  return fs.readFileSync(path)
}

function setResourceValue(deviceId: string, resourceURI: string, value: any, mimeType: string): PromiseLike<any> {
  logger.info('Setting value: ', value, 'to ', deviceId, resourceURI);
  return connectApi.setResourceValue(deviceId, resourceURI, value, false, mimeType)
  .then((response) => logger.info('Set response:', JSON.stringify(response)))
  .catch((error) => logger.error('Set error:', error))
}

function setResourceValues(): Promise<any> {
  return Promise.map(MBED_DEVICE_IDS_TO_WRITE, (deviceId: string) =>
      Promise.map(
        uris, 
        (uri_prop: any)  => {
          if(uri_prop.payload_type === 'binary')  {
            return setResourceValue(deviceId, uri_prop.uri, readFile(uri_prop.path), 'application/octet-stream');
          } else  {
            return setResourceValue(deviceId, uri_prop.uri, uri_prop.payload, 'application/json');
          }
        },
        {concurrency: 1}
  ));
}


function executeResource(deviceId: string, resourceURI: string): PromiseLike<any> {
  logger.info(`Executing ${deviceId}${resourceURI}`);
  return new Promise((resolve, reject)  =>  {
    connectApi.executeResource(deviceId, resourceURI, undefined, false, 'text/plain')
    .then((response) => {
      logger.info('Execute response:', JSON.stringify(response));
      if(response != '0' && response != null) {
        reject('The device rejected transfer of oem, error code: ' + response);
      } else  {
        resolve(response);
      }
    })
    .catch((error) => logger.error('Execute error:', error))
  });
}

function executeResources(): Promise<any> {
  return Promise.map(MBED_DEVICE_IDS_TO_WRITE, (deviceId: string) =>
    Promise.map(
      MBED_DEVICE_RESOURCE_URIS_TO_EXECUTE,
      (resourceURI: string) => executeResource(deviceId, resourceURI),
      {concurrency: 1}
  ));
}

function getResourceValue(deviceId: string, uri_prop: any, mimeType: string): PromiseLike<any> {
  logger.info(`Getting value ${deviceId}${uri_prop.uri}`);
  return new Promise((resolve, reject)  =>  {
    connectApi.getResourceValue(deviceId, uri_prop.uri, false, false, mimeType)
    .then((response) => {
      logger.info('getResourceValue response:', JSON.stringify(response));
      if(uri_prop.payload == response) {
          logger.info('resource id ', uri_prop.uri, ' set/get value identical');
          resolve(response);
      }
      else {
          if(uri_prop.payload_type === 'binary') {
              var buf = readFile(uri_prop.path);
              var ret_bin = Buffer.from(response, 'binary');
              var ret_hex = Buffer.from(response, 'hex');
              if(Buffer.compare(ret_bin, buf) == 0 || Buffer.compare(ret_hex, buf) == 0)
              {
                  logger.info('resource id ', uri_prop.uri, ' set/get value identical');
                  resolve(response);
              } else {
                  logger.info('resource id ', uri_prop.uri, ' set/get value mismatch');
                  reject('resource id ' + uri_prop.uri + ' set/get value mismatch');
              }
               
          } else {
              logger.info('resource id ', uri_prop.uri, ' set/get value mismatch');
              reject('resource id ' + uri_prop.uri + ' set/get value mismatch');
          }
      }
    })
  .catch((error) => logger.error('Get error:', error))
  });
}


function getResourceValues(): Promise<any> {
  return Promise.map(MBED_DEVICE_IDS_TO_WRITE, (deviceId: string) =>
    Promise.map(
      uris,
      (uri_prop) =>  {
        if(uri_prop.payload_type === 'binary')  {
          return getResourceValue(deviceId, uri_prop, 'application/octet-stream');
          //return getResourceValue(deviceId, uri_prop, 'text/plain');
        } else  {
          return getResourceValue(deviceId, uri_prop, 'text/plain');
        }
      },
      {concurrency: 1}
  ));
}

function cleanup() {
  if (connectApi) {
    if (!POLL_MODE) {
      connectApi.deleteWebhook();
    }
  }
}

function cleanupAndExit(statusCode: number) {
  cleanup();
  process.exit(statusCode);
}

function validateParams() {
  if (!MBED_CLOUD_API_KEY) {
    logger.error('You must specify MBED_CLOUD_API_KEY');
    cleanupAndExit(9);
  }
  if (MBED_DEVICE_IDS_TO_WRITE.length === 0) {
    logger.error('You must specify MBED_DEVICE_IDS_TO_WRITE');
    cleanupAndExit(9);
  }
}

process.on('SIGINT', () => {
  cleanupAndExit(0);
});


function main() {
  validateParams();
  connectApi = createConnectApi();
  deviceDirectoryApi = createDeviceDirectoryApi();
  (POLL_MODE ? startPolling() : bindCallbackChannel())
  .then(() => checkDevices())
  .then(() => setResourceValues())
  .then(() => executeResources())
  .then(() => Promise.delay(180 * 1000))
  .then(() => getResourceValues())
  .then(() => logger.info('All done.'))
  .then(() => cleanupAndExit(0))
  .catch((error) => {
    logger.error('Error:', error);
    cleanupAndExit(1);
  });

}

main();
