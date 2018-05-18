// global packages and variables are set in main.html and main.js

// initialize settings update page
function init_about() {
    
    var info = '' +
  
    '<tr>' +
    '    <td>Node.js:</td>' +
    '    <td>' + global.process.versions.node + '</td>' +
    '</tr>' +
    '<tr>' +
    '    <td>Version:</td>' +
    '    <td>' + 'V1.0' + '</td>' +
    '</tr>'; 
        
    $("#about-info").html(info);
}

