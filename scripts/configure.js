function myExecSync(cmd) {
    var e = process.env;
    e.MBED_CLOUD_API_KEY = strAPIKey;
    e.MBED_DEVICE_IDS_TO_WRITE = IDS_towrite;
    e.SW_MANUFACTURER = manufacturer;
    e.SW_MODEL_NUMBER = modelNumber;
    e.SW_DEVICE_TYPE = devicetype;
    e.VENDER_ID = "SW-Vendor/SWV_VendorId.bin";
    e.CLASS_ID = "SW-Vendor/SWV_ClassId.bin";
    e.UPDATE_AUTH_CERT = "SW-Vendor/default.der";
    e.ENABLE_OEM_ROLE_CLAIM = enable_claim;
    e.MIN_FW_VESION_MONOTONIC_COUNTER = minfwversion;


    var output = execSync(cmd, {
        cwd: 'mbed-cloud-sdk-javascript-example-oem-role-claim',
        env: e,
    });

    $.unblockUI();
    
    $("#devicediv").empty();
    $("#inputKey").val('');
    $("#manufacturer").val('');
    $("#modelNumber").val('');
    $("#devicetype").val('');
    $("#vendorid").val('');
    $("#classid").val('');
    $("#select-file").val('');
    $("#enable_claim").val('');
    $("#minfwversion").val('');
    
}

function apply() {

    var devices = [];
    $("input[name='registerdevice']:checked").each(function () {
        devices.push(this.value);
    });


    for (var i = 0; i < devices.length; i++) {
        IDS_towrite += devices[i] + ",";
    }
    console.log(IDS_towrite);

    manufacturer = $.trim($("#manufacturer").val());
    modelNumber = $.trim($("#modelNumber").val());
    devicetype = $.trim($("#devicetype").val());
    enable_claim = $.trim($("#enable_claim").val());
    minfwversion = $.trim($("#minfwversion").val());

    var sb = new StringBuilder();
    sb.appendFormat("MBED_CLOUD_DEVICE_SERVER_API={0}", MBED_CLOUD_DEVICE_SERVER_API);
    sb.appendLine();
    sb.appendFormat("MBED_CLOUD_API_KEY={0}", strAPIKey);
    sb.appendLine();
    sb.appendFormat("MBED_DEVICE_IDS_TO_WRITE={0}", IDS_towrite);
    sb.appendLine();
    sb.appendFormat('SW_MANUFACTURER="{0}"', manufacturer);
    sb.appendLine();
    sb.appendFormat('SW_MODEL_NUMBER="{0}"', modelNumber);
    sb.appendLine();
    sb.appendFormat('SW_DEVICE_TYPE="{0}"', devicetype);
    sb.appendLine();
    sb.appendFormat('VENDER_ID="SW-Vendor/SWV_VendorId.bin"');
    sb.appendLine();
    sb.appendFormat('CLASS_ID="SW-Vendor/SWV_ClassId.bin"');
    sb.appendLine();
    sb.appendFormat('UPDATE_AUTH_CERT="SW-Vendor/default.der"');
    sb.appendLine();
    sb.appendFormat("ENABLE_OEM_ROLE_CLAIM={0}", enable_claim);
    sb.appendLine();
    sb.appendFormat("MIN_FW_VESION_MONOTONIC_COUNTER={0}", minfwversion);
    sb.appendLine();

    fs.writeFileSync('mbed-cloud-sdk-javascript-example-oem-role-claim/.env', sb.toString())

    console.log('.env Saved!');

    var selectfile_path = document.getElementById("select-file").files[0].path;
    try {
        fs.copySync(selectfile_path, 'mbed-cloud-sdk-javascript-example-oem-role-claim/SW-Vendor/default.der');
        console.log('copy cert success');
    } catch (err) {
        console.error(err);
    }

    var vendorid_input = $("#vendorid").val();
    var vendorid = new Buffer(16);
    for (var p = 0; p < vendorid.length; p++) {
        vendorid[p] = parseInt(vendorid_input.substring(2 * p, 2 * p + 2), 16);
    }
    // console.log(vendorid);

    fs.writeFileSync('mbed-cloud-sdk-javascript-example-oem-role-claim/SW-Vendor/SWV_VendorId.bin', vendorid);

    var classid_input = $("#classid").val();

    var classid = new Buffer(16);
    for (var q = 0; q < classid.length; q++) {
        classid[q] = parseInt(classid_input.substring(2 * q, 2 * q + 2), 16);
    }
    // console.log(classid);

    fs.writeFileSync('mbed-cloud-sdk-javascript-example-oem-role-claim/SW-Vendor/SWV_ClassId.bin', classid);

    // fs.copyFileSync('$("#select-file").val()', 'mbed-cloud-sdk-javascript-example-oem-role-claim/SW-Vendor/default.der');
    // $("input[type=text]").val("");
    // $("input[name='registerdevice']:checked").attr("checked", false);

    $.blockUI();

    dialog.info('Please check update status on Device Console and Mbed Cloud.', 'Verify');
    // confirm('Please Check Update Status on Devie Console and ARM Mbed Cloud.');
    myExecSync('start cmd /k "npm start');
}

function CreateCheckBoxList(checklistItems) {
    var str = "";
    for (var i = 0; i < checklistItems.length; i++) {
        str += "<tr><td><input type='checkbox' name='registerdevice' style='margin-left:5px; margin-top:3px;' value='" + checklistItems[i] + "'></td><td>" + checklistItems[i] + "</td></tr>";
    }
    $("#devicediv").removeAttr('data-placeholder');
    $("#devicediv").html(str);
    return false;
}

var listArr = [];
function createDeviceDirectoryApi(MBED_CLOUD_DEVICE_SERVER_API, MBED_CLOUD_API_KEY) {
    var devices;
    var deviceDirectoryApi = new MbedCloudSDK.DeviceDirectoryApi({ host: MBED_CLOUD_DEVICE_SERVER_API, apiKey: MBED_CLOUD_API_KEY });
    devices = deviceDirectoryApi.listDevices({
        filter: {
            state: { $eq: "registered" }
        }
    }, function (error, devices) {

        for (var i = 0; i < devices.data.length; i++) {
            listArr[i] = devices.data[i].id;
            console.log(listArr[i]);
        }
        CreateCheckBoxList(listArr);
        if (error) throw error;
    });

}


function createConnectApi(MBED_CLOUD_DEVICE_SERVER_API, MBED_CLOUD_API_KEY) {
    var connectApi = new MbedCloudSDK.ConnectApi({ host: MBED_CLOUD_DEVICE_SERVER_API, apiKey: MBED_CLOUD_API_KEY });
    return connectApi;
}

function validateParams(MBED_CLOUD_API_KEY) {
    if (!MBED_CLOUD_API_KEY) {
        console.log('Lack of specifying MBED_CLOUD_API_KEY');
    } else {
        console.log('API_KEY OK!');
    }
}

function submit() {
    strAPIKey = document.getElementById('inputKey').value;
    validateParams(strAPIKey);
    connectApi = createConnectApi(MBED_CLOUD_DEVICE_SERVER_API, strAPIKey);
    deviceDirectoryApi = createDeviceDirectoryApi(MBED_CLOUD_DEVICE_SERVER_API, strAPIKey);
    $('.cat_textbox').removeAttr('disabled');
    $('#apply').removeAttr('disabled');
    document.getElementById("details").disabled = false;
    return false;
}

function init_configure() {

    $('.cat_textbox').attr('disabled', 'disabled');
    $('#apply').attr('disabled', 'disabled');
    document.getElementById("details").disabled = true;

}