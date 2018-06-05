## Before you start

1. Ensure devices are connected to your Mbed Cloud acount by following the steps in [First-to-Claim by enrollment list](https://cloud.mbed.com/docs/current/connecting/device-ownership.html)
2. Please read [Arm Mbed Cloud Update client](https://cloud.mbed.com/docs/current/updating-firmware/client-side.html) to create authenticity certificate required later on


### Prerequisites
OS: Windows ONLY
Node.js: Version 6 or above.


### Installation
Open a command prompt (Cmd. exe), navigate to the location of your folder.
Execute the tool by running command
# npm start


### Using the Tool

The following fields are required: 

* Your API Key
   Create API Key in Mbed Cloud Portal

* Device List
   Registered devices will automatically be listed when API Key is submitted.
   If there’s no registered devices, please check the network connection of devices.

* SW Manufacturer = Fill in name of your Company
* SW Model number = Fill in name of your Company
##SW Manufacturer OR SW Model number MUST be different from last update.##

* SW Device type = Gateway
* Enable OEM Role Claim = True  (stay unlocked) /False (lock)
* Vendor ID = Your unique Vendor ID
* Class ID = Your unique Class ID
* Update_AUTH_CERT (Firmware Update authenticity certificate) = Select authenticity certificate
* OEM transfer mode = 1 (True)
* Minimum FW Version Monotonic Counter = Set a value greater than 0

