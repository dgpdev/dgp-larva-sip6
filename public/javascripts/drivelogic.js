/**
 * Created by Steve on 18/08/2017.
 */
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
  console.log('driveLogic.js loaded');
  listDrives();

  var clipboard = new Clipboard('.copy');
  clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
  });

  var inherit = new Clipboard('.copy-me');
  inherit.on('success', function(e) {
    toastr.success('Copied successfully.', 'Error occured!');
  })
});


$.blockUI.defaults.overlayCSS.opacity = .2;
var tempDrive;


/** INHERITS **/
$('.ENC_SHARING').on('click', function (e){
  e.preventDefault();

  $('#inheritance .instructions').hide();
  $('#INHERIT_STEP_2').show();

  var data = {};
  data.drive = $( "#DRIVE_LIST").val();
  data.time = $( "#TIME_LIST").val();
  data.receiver = $('#FULL-NAME').val();
  data.birth = $('#BIRTH').val();
  data.email = $('#EMAIL').val();

  $.ajax({
    method: 'get',
    url: '/larva/makepublic',
    data: data,
    processData: false,
    contentType: false
  }).done(function(buckets) {
    if (buckets.status === 'fail') {
      // Error handling
      toastr.error(buckets.message, 'Error occured!')
    }
    if (buckets.status === 'success') {
      $('#hashkey').val(buckets.data.nSalt);
      $('#pubhash').val(buckets.data.hash);
    }
  })
});

/* @ ToDo check this function, rename drive with vault */
/** DRIVES **/
$('.BTN_ADD_DRIVE').on('click', function (e){
  e.preventDefault();

  $('#DRIVE_SECTION').block({
    message: advancedBlocker('Loading drives...'),
    theme: true
  });

  var data = {};
  data.driveID =  $("#drive-name").val();
  data.msg = 'none';

  $.ajax({
    method: 'POST',
    url: '/larva/vault/create',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(buckets) {
    if (buckets.status === 'fail') {
      // Error handling
      toastr.error(buckets.message, 'Error occured!')
    }
    if (buckets.status === 'success') {
      toastr.success('Vault '+data.driveID+' created', 'Success!');
      listFiles(buckets.message.split('#')[1].replace('created', ''));
    }
    $('#DRIVE_SECTION').unblock();
    listDrives();
  })
});


$('.BTN_DRIVE_LIST').on('click', function (e){
  e.preventDefault();
  listDrives();
});


// User login view
$('.upload-btn').on('click', function (){
  $('#upload-input').click();
  $('.progress-bar').text('0%');
  $('.progress-bar').width('0%');
});


// Files have been selected to start uploading
$('#upload-input').on('change', function(){
  var files = $(this).get(0).files;
  var drive = $(this).closest('tr').children('.driveid').text();
  $('#driveID').val(tempDrive);

  $('#DRIVE_SECTION').block({
    message: advancedBlocker('Uploading to blockchain...'),
    theme: true
  });

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    var existing = $.map($('.filenames strong'), function(el) { return $(el).html() } );
    var uploadable = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // Check whether same file name does not exist yet
      if (existing.indexOf(file.name) == -1) {
        // add the files to formData object for the data payload
        formData.append('uploads', file, file.name);
        formData.append('driveID', tempDrive);
        existing.push(file.name);
        uploadable++;

      } else {
        // it exists, so show toastr error
        toastr.warning('Only one file with such name can exist in the vault.', 'File name taken!');
      }
    };
    if (uploadable > 0) {
      $.ajax({
        url: '/larva/uploadz',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          console.log('upload successful! : ' + data.filename);
          toastr.success('successfuly stored on the blockchain.', 'Upload done!');
          $('#DRIVE_SECTION').unblock();
          listFiles(tempDrive);
        }
      });
    } else {
      $('#DRIVE_SECTION').unblock();
    }
  }
});


$('#FILE_LIST').on( 'click', 'button.download', function () {
  downloadFile($(this).attr('data-drive'), $(this).attr('data-filename'), $(this).attr('data-id'), $(this).attr('data-mime'));
  console.log($(this).attr('data-drive'));
});

$('#DRIVE_LIST').on( 'click', '.btn-getdrive', function () {
  listFiles($(this).attr('data-drive'));
});

$('.refresh-files').on('click', function() {
  listFiles($(this).attr('data-drive'));
})

$('#DRIVE_LIST').on( 'click', '.btn-up', function (el) {
  tempDrive = $(el.target).data('drive');
  $('#driveID').val(tempDrive);
  $('#upload-input').click();
});

$('#DRIVE_LIST').on( 'click', '.btn-inherit-drive', function () {
  window.location = '/drive/inherit/';
});

$('#DRIVE_LIST').on( 'click', '.btn-trash', function () {
  tempDrive = $(this).closest('tr').children('.driveid').text();
  console.log("Deleting drive: " + tempDrive );
  deleteVault(tempDrive);
  // Call ajax to drives:delete
});


function downloadFile(containerID, filename, fileID, fileMime) {
  $('#DRIVE_SECTION').block({
    message: advancedBlocker('Preparing download, please wait...'),
    theme: true
  });

  var data = {};
  data.driveID = containerID;
  data.fileID = fileID;
  data.fileNAME = filename;
  data.MIME = fileMime;

  console.log(data);

  $.ajax({
    method: 'POST',
    /* /list/:id/download/:name/:fileid/mime/:mime */
    url: '/vault/file/download',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(response) {

    $('#DRIVE_SECTION').unblock();
    if (response.status === 'fail') {
      // Error handling
      toastr.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      // Error handling
      toastr.success(response.message, 'Success!');
      console.log(response.tmp);
      window.location = '/download/' + response.tmp + '/' + filename ;
    }
  })
}


function deleteVault(vaultID) {
  var data = {};
  data.vaultID = vaultID;

  $.ajax({
    method: 'POST',
    url: '/larva/vault/delete',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(response) {

    $('#DRIVE_SECTION').unblock();
    if (response.status === 'fail') {
      // Error handling
      toastr.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      // Error handling
      toastr.success(response.message, 'Success!');
      location.reload();

    }
  })
}


function deleteFile(elem) {
  var data = {};
  data.driveID = $(elem).data('drive');
  data.fileID = $(elem).data('id');

  console.log(data);

  $.ajax({
    method: 'POST',
    /* /list/:id/download/:name/:fileid/mime/:mime */
    url: '/larva/vault/list/files/delete',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(response) {

    $('#DRIVE_SECTION').unblock();
    if (response.status === 'fail') {
      // Error handling
      toastr.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      // Error handling
      toastr.success(response.message, 'Success!');
      listFiles($(elem).data('drive'));
    }
  })
}


/* Get the drives available */
// SIP6 rename
function listDrives() {
  $('#DRIVE_SECTION').block({
    message: advancedBlocker('Loading vaults...'),
    theme: true
  });

  $.ajax({
    method: 'GET',
    url: '/vault'
  }).done(function(buckets) {
    if (buckets.status === 'fail') {
      // Error handling & dirty fix for hiding error when no drives have been created
      if ($('#DRIVE_LIST tr').length != 0) {
        toastr.error(buckets.message, 'Error occured!')
      }
      $('#DRIVE_SECTION').unblock();
    }
    var primary_drive;
    if (buckets.status === 'success') {
      // Error handling
      $('.first-vault-creation').hide();
      var table = $("#DRIVE_LIST");
      table.empty();
      table.append("<thead><tr><td>Vault name</td><td>Vault ID</td><td class=\"text-right\">Actions</td></tr>");
      table.append("<tbody>");

      buckets.result.forEach(function(bucket) {
        table.append("<tr valign='middle'><td><strong>" + bucket.name + "</strong></td><td class='driveid'>" + bucket.id +"</td><td class=\"text-right\"> " +
            "<button class='btn btn-outline-primary btn-sm mb-1 btn-getdrive' data-drive='"+ bucket.id +"'>View contents</button> " +
            "<button class='btn btn-outline-primary btn-sm mb-1 btn-up' data-drive='" + bucket.id +"'>Add files</button> " +
            "<button class='btn btn-primary btn-sm mb-1 btn-inherit-drive'>Inherit</button> " +
            "<button class='btn btn-danger btn-sm mb-1 btn-trash'><i class='fa fa-trash-o' aria-hidden='true'></i></button> " +
            "</td></tr>");
        primary_drive = bucket.id;
      });
      table.append("</tbody>");
      $('#DRIVE_SECTION').unblock();
      console.log(primary_drive);
      listFiles(primary_drive);
    }
  })
}


function listFiles(driveID) {

  var data = {};
  var fileSize = 0;
  data.driveID = driveID;
  data.msg = 'none';

  console.log('requesting drive ,' + data.driveID);
  $('.refresh-files').attr('data-drive', driveID);
  $.ajax({
    method: 'POST',
    url: '/vault/files',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(bucketsWithFiles) {
    if (bucketsWithFiles.status === 'fail') {
      // Error handling
      if (bucketsWithFiles.message.indexOf('empty') == -1) {
        toastr.error(bucketsWithFiles.message, 'Error occured!')
      } else {
        $('.btn-getdrive[data-drive="'+driveID+'"]').addClass('hide');
        toggleFileList(false);
      }
    }
    if (bucketsWithFiles.status === 'success') {
      toggleFileList(true);
      $('.btn-getdrive[data-drive="'+driveID+'"]').removeClass('hide');
      var table = $("#FILE_LIST");
      table.empty();

      table.append("<thead><tr><td>Filename</td><td>MIME</td><td class=\"text-right\">Action</td></tr>");
      table.append("<tbody>");

      bucketsWithFiles.files.reverse().forEach(function(file) {
        //console.log(bucket);
        table.append("<tr><td class='filenames'><strong>" + file.filename + "</strong></td><td>" + file.filename.split('.').pop() + "</td> " +
            "<td class=\"text-right\"><button class='btn btn-success download text-white btn-sm' data-mime='"+ file.filename.split('.').pop() +"' data-id='"+ file.id +"' data-drive='"+ data.driveID +"' data-filename='"+ file.filename +"'> " +
            "<i class='fa fa-download' aria-hidden='true'></i></button> " +
            "<button class='btn btn-danger text-white btn-sm' onClick='deleteFile(this);' data-id='"+ data.driveID +"' data-drive='"+ driveID +"'> " +
            "<i class='fa fa-trash' aria-hidden='true'></i></button></td> " +
            "</tr>");
        fileSize += file.size;
      });
      table.append("</tbody>");
      $( ".file-actions" ).show();

      positionSizeRemainder(fileSize);
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


// Allows hiding and showing File List
function toggleFileList(forced) {
  element = $('.row_filelist')
  if (element.hasClass('open') && !forced) {
    element.removeClass('open').fadeOut('fast');
  } else {
    element.addClass('open').fadeIn('fast');
  }
}


// Adds custom wrapper around BluckUI
function advancedBlocker(input_message) {
  message = '<div class="loader">Loading...</div>';
  message += '<p>'+input_message+'</p>';
  return message;
}


function logout() {
    var data = {};

    $.ajax({
      method: 'POST',
      url: '/larva/logout',
      data: JSON.stringify(data),
      contentType:  'application/json',
      processData: false
    }).done(function(response) {
      window.location = '/';
    }).error(function(error) {
      console.log(error)
    })
}


// Handles positioning of remaining free space in the drive
function positionSizeRemainder(current_size) {
  progress = $('.remaining-size .progress');
  taken_space = $('.remaining-size .progress-bar');
  taken_space_wrap = $('.remaining-size .text-remainder');
  taken_space_text = $('.remaining-size .text-remainder > span');

  cap = 500 * 1024 * 1024
  percent = current_size / cap * 100

  taken_space.css('width', percent+'%');
  taken_space_wrap.css('left', percent+'%');
  taken_space_text.removeClass('left right')
  $('#remaining-size').html(Math.round((cap - current_size) / 1024 / 1024) + ' Mb')
  if (progress.outerWidth() - taken_space.outerWidth() - taken_space_text.outerWidth() > 0) {
    taken_space_text.addClass('left');
  } else {
    taken_space_text.addClass('right');
  }
}
