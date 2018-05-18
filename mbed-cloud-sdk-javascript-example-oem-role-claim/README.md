# Mbed-cloud-sdk-javascript-example-oem-transfer-confidential
Small TypeScript example on howto set/execute custom resources using Mbed Cloud SDK JavaScript.


## Prerequisites
* Node.js version >4.8 (https://nodejs.org)


## Dependencies
* mbed-cloud-sdk (https://github.com/ARMmbed/mbed-cloud-sdk-javascript)
* bluebird (http://bluebirdjs.com)
* body-parser (https://github.com/expressjs/body-parser)
* express (http://expressjs.com/)
* winston (https://github.com/winstonjs/winston)
* dotenv (https://github.com/motdotla/dotenv)
### Development dependencies
* typings (https://github.com/DefinitelyTyped/DefinitelyTyped)
  * bluebird
  * body-parser
  * express
  * node
  * winston
  * dotenv
  * ngrok
* typescript (https://github.com/Microsoft/TypeScript)
* ts-node (https://github.com/TypeStrong/ts-node)


## Installation guide
1. Install Node.js
	* Verify both node and npm are found in PATH: `node -v` and `npm -v`
2. Clone repository `git clone https://github.com/ARMmbed/mbed-cloud-sdk-javascript-example-oem-transfer-confidential.git`.
3. Move to the project directory `cd mbed-cloud-sdk-javascript-example-oem-transfer-confidential`.
4. Install node modules with `npm install`.
5. Fill your 'MBED_CLOUD_DEVICE_SERVER_API', 'MBED_CLOUD_API_KEY' and 'MBED_DEVICE_IDS_TO_WRITE' in the .env file
5. Run the example: 
        npm start

## Running from behind firewall
When POLL_MODE is set to false this example will set an external callback
for push notifications using Express (https://expressjs.com/) and a tunnel
using ngrok (https://ngrok.com/). Tunnel is set because development hosts
are typically placed behind firewall. By default POLL_MODE is set to true
and SDK will poll for notifications periodically.


## Variables
* MBED_CLOUD_API_KEY: Mbed cloud REST API access key
* MBED_CLOUD_DEVICE_SERVER_API: Mbed cloud REST api location
* MBED_DEVICE_IDS_TO_WRITE: list of Mbed device endpoint ids whose resources will be written
* MBED_DEVICE_IDS_TO_LISTEN: list of endpoint ids to presubscribe for notifications (default all endpoints)
* MBED_DEVICE_RESOURCE_URIS_TO_LISTEN: list of resourceURIS to presubscribe for notifications (default all resources)
* MBED_DEVICE_RESOURCE_URIS_TO_SET: list of custom resource uris to set (default /33000/0/1 through /33000/0/7)
* MBED_DEVICE_RESOURCE_URIS_TO_EXECUTE: list of custom resource uris to execute (default /33000/0/8)
* POLL_MODE: when true Mbed Cloud SDK will poll for notifications (default), false use push nofitications
* NOTIFICATION_SERVER_PORT: local port which Express server will listen for nofications when POLL_MODE is false
