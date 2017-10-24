/**
 * Created by Steve on 17/08/2017.
 */

$(document).ready(function() {
    console.log('indexLogic.js loaded');
});

/** AUTH **/

$('.BTN_AUTH_PLAIN').on('click', function (e){
    e.preventDefault();

    var data = {};
    data.key = $( "#KEY_PLAIN").val();
    data.msg = 'yrdy';

    $.ajax({
        method: 'POST',
        url: '/keypair/generate/privatekey',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(response) {

        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
        }
        if (response.status === 'success') {
            toastr.success(response.message, 'Success')
        }

    })

});

$('.BTN_GENERATE_SHARE').on('click', function (e){
    event.preventDefault();

    var data = {};
    data.cHash = $('#KEY_HASH_SHOW').val();
    data.cSharing = $('#KEY_SHARING_SHOW').val();
    data.message = "message";

    $.ajax({
        method: 'POST',
        url: '/keypair/makepublic',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(response) {

        console.log(response.message);
        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
        }
        if (response.status === 'success') {
            // Error handling
            //window.location = '/api/';
            toastr.success(response.message, 'Success!!');
            console.log (response.data);
            $('input[name="KEY_HASH_SHOW"]').val(response.data.hash);
            $('input[name="KEY_SHARING_SHOW"]').val(response.data.nSalt);


        }
    })
});

$('.BTN_AUTH_SHARE').on('click', function (e){
    event.preventDefault();

    var data = {};
    data.cHash = $( "#KEY_HASH").val();
    data.cSharing = $( "#KEY_SHARING").val();
    data.message = "message";

    $.ajax({
        method: 'POST',
        url: '/keypair/decrypt',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(response) {

        console.log(response.message);
        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
        }
        if (response.status === 'success') {
            // Error handling
            toastr.success(response.message, 'Success!!');

            /* REPOST */
            var data2 = {};
            data2.key = response.key;
            data2.msg = 'yrdy';

            $.ajax({
                method: 'POST',
                url: '/keypair/generate/privatekey',
                data: JSON.stringify(data2),
                contentType:  'application/json',
                processData: false
            }).done(function(response) {

                if (response.status === 'fail') {
                    // Error handling
                    toastr.error(response.message, 'Error occured!')
                }
                if (response.status === 'success') {
                    toastr.success(response.message, 'Success')
                }

            })

            /**/


        }
    })
});


$('.BTN_REGISTER').on('click', function(event) {

    event.preventDefault();
    var data = {};
    data.user = $('#USER_EMAIL').val();
    data.pass = $('#USER_PASS').val();
    data.message = "message";

    $.ajax({
        method: 'POST',
        url: '/keypair/register',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(response) {

        console.log(response.message);
        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
        }
        if (response.status === 'success') {
            // Error handling
            toastr.success(response.message, 'Success!');
            interval = setInterval(function(){awaitActivation(data)},5000);

        }
    })

    //$('.user_register').unblock();

});

var interval;

function awaitActivation(data) {
    $.ajax({
        method: 'POST',
        url: '/keypair/activate/',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false,
        complete: function ( resp) {

        }
    }).done(function(response) {


        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')

        }
        if (response.status === 'success') {
            toastr.success(response.message, 'Success');
            clearInterval(interval);
        }

    })
}

/** DRIVES **/
$('.BTN_DRIVE_LIST').on('click', function (e){
    e.preventDefault();
    listDrives();
});

$('#DRIVE_LIST').on( 'click', 'button', function () {
    listFiles($(this).attr('data-drive'));
});


$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');

});

$('#upload-input').on('change', function(){

    var files = $(this).get(0).files;

    if (files.length > 0){
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // add the files to formData object for the data payload
            formData.append('uploads[]', file, file.name);
            formData.append('driveID', '48abcd96fc8811d946ac4884');
        }

        $.ajax({
            url: '/drive/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data){
                console.log('upload successful! : ' + data.filename);
                $(".progress-state").text('File successfuly stored on the blockchain.');
                $('.panel-default').unblock();
            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();

                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {

                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Done');
                            $(".progress-state").text('Local upload done, storing in the blockchain...');
                            $('.panel-default').block({ message: 'Storing files on the blockchain..' });
                        }

                    }

                }, false);

                return xhr;
            }
        });

    }
});



$('#FILE_LIST').on( 'click', 'button', function () {

    downloadFile($(this).attr('data-drive'), $(this).attr('data-filename'), $(this).attr('data-id'), $(this).attr('data-mime'));

});



function downloadFile(containerID, filename, fileID, fileMime) {
    $('.row_filelist').block({ message: 'Preparing download, please wait..' });

    var data = {};
    data.driveID = containerID;
    data.fileID = fileID;
    data.fileNAME = filename;
    data.MIME = fileMime;

    console.log(data);


    $.ajax({
        method: 'POST',
        /* /list/:id/download/:name/:fileid/mime/:mime */
        url: '/drive/list/files/download',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(response) {

        $('.row_filelist').unblock();
        if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
        }
        if (response.status === 'success') {
            // Error handling
            toastr.success(response.message, 'Success!');
            //window.location = '/api/files/download/local/' + filename ;
        }

    })

}



/* Get the drives available */
function listDrives() {
    $('.row_drivelist').block({ message: 'Loading drives..' });
    $.ajax({
        method: 'GET',
        url: '/drive/list'
    }).done(function(buckets) {

        if (buckets.status === 'fail') {
            // Error handling
            toastr.error(buckets.message, 'Error occured!')
        }
        if (buckets.status === 'success') {
            // Error handling
            var table = $("#DRIVE_LIST");
            table.empty();
            table.append("<thead><tr><td>Drive name</td><td>Driver ID</td><td>Actions</td></tr>");
            table.append("<tbody>");

            buckets.buckets.forEach(function(bucket) {
                table.append("<tr valign='middle'><td><strong>" + bucket.name + "</strong></td><td>" + bucket.id +"</td><td class='right'> " +
                    "<button class='button button-outline btn-getdrive btn-icon' data-drive='"+ bucket.id +"'><i class='fa fa-search' aria-hidden='true'></i></button> " +
                    "<button class='btn btn-md btn-getdrive button-outline btn-icon'><i class='fa fa-trash-o' aria-hidden='true'></i></button> " +
                    "</td></tr>");
            });
            table.append("</tbody>");
        }
        $('.row_drivelist').unblock();
    })
}


function listFiles(driveID) {

    var data = {};
    data.driveID = driveID;
    data.msg = 'none';


    console.log('requesting drive ' + driveID);
    $.ajax({
        method: 'POST',
        url: '/drive/list/files',
        data: JSON.stringify(data),
        contentType:  'application/json',
        processData: false
    }).done(function(bucketsWithFiles) {

        if (bucketsWithFiles.status === 'fail') {
            // Error handling
            toastr.error(bucketsWithFiles.message, 'Error occured!')
        }
        if (bucketsWithFiles.status === 'success') {
            var table = $("#FILE_LIST");
            table.empty();

            table.append("<thead><tr><td>Filename</td><td>MIME</td><td class='right'>Action</td></tr>");
            table.append("<tbody>");

            $(".file-action-inherit").html("<button class='btn btn-md btn-primary' data-drive='" + driveID+ "'><i class='ion-locked ion-icon'></i>Make this drive inheritable</button>");


            bucketsWithFiles.files.forEach(function(bucket) {
                //console.log(bucket);
                table.append("<tr><td class='filenames'>" + add3Dots(bucket.filename, 20) + "</td><td>" + bucket.filename.split('.').pop() + "</td> " +
                    "<td class='right'><button class='button button-outline btn-icon' data-mime='"+ bucket.filename.split('.').pop() +"' data-id='"+ bucket.id +"' data-drive='"+ bucket.bucket +"' data-filename='"+ bucket.filename +"'> " +
                    "<i class='fa fa-download' aria-hidden='true'></i></button></td> " +
                    "</tr>");
            });
            table.append("</tbody>");
            $( ".file-actions" ).show();
        }

    })
}


function add3Dots(string, limit) {
    var dots = "...";
    if(string.length > limit)
    {
        // you can also use substr instead of substring
        string = string.substring(0,limit) + dots;
    }

    return string;
}

