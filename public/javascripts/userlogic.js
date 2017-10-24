/**
 * Created by Steve on 18/08/2017.
 */

$(document).ready(function() {
  console.log('UserLogic.js loaded');

  // Prevent submitting empty form
  $('#logins .hash-access .minlength').on('keyup', function() {
    if ($('#KEY_HASH').val().length > 3 && $('#KEY_SHARING').val().length > 3) {
      $('.BTN_AUTH_SHARE').removeClass('disabled').prop('disabled', false);
    } else {
      $('.BTN_AUTH_SHARE').addClass('disabled').prop('disabled', true);
    }
  });

  // Prevent submitting empty form
  $('#logins .minlength').on('keyup', function() {
    if ($('#KEY_PLAIN').val().length > 3) {
      $('.BTN_AUTH_PLAIN').removeClass('disabled').prop('disabled', false);
    } else {
      $('.BTN_AUTH_PLAIN').addClass('disabled').prop('disabled', true);
    }
  });

  // Prevent submitting empty form
  $('#logins .credential-access .minlength').on('keyup', function() {
    if ($('#EMAIL_LOGIN').val().length > 3 && $('#PASSWORD_LOGIN').val().length > 3) {
      $('.BTN_AUTH_LOGIN').removeClass('disabled').prop('disabled', false);
    } else {
      $('.BTN_AUTH_LOGIN').addClass('disabled').prop('disabled', true);
    }
  });

  // Prevent submitting empty form
  $('#signup .minlength').on('keyup', function() {
    if ($('#USER_EMAIL').val().length > 3 && $('#USER_PASS').val().length > 3) {
      $('.BTN_REGISTER').removeClass('disabled').prop('disabled', false);
    } else {
      $('.BTN_REGISTER').addClass('disabled').prop('disabled', true);
    }
  });


  // Have to use custom tabbing logic due to Bootstrap issue with nested tabs
  $('.selection a').on('click', function(el) {
    url = $(el.target).prop('href');
    target_tab = url.substring(url.indexOf('#')+1);
    $('.selection a').each(function(ind, btn) {
      $(btn).removeClass('active');
    });
    $(el.target).addClass('active');
    $('#login-tabs > .tab-pane').each(function(ind, tab) {
      $(tab).removeClass('active');
      $('#login-tabs #'+target_tab).addClass('active').addClass('show');
    });
  });

  /* LOGIN WITH KEYPAIR */
  $('.BTN_AUTH_PLAIN').on('click', function (e){
    e.preventDefault();

    $('#AUTH_SECTION').block({ message: 'Decrypting keypair' });

    /* TODO Check length of input. If length > private key (65 chars):
      - show page where user can enters passphrase
      - call decrypt function from that page
      - on success, call same function as this one to login using browser stored session

      If length <= private key, simply proceed
       */

    var data = {};
    data.key = $( "#KEY_PLAIN").val();
    data.msg = 'yrdy';

    $.ajax({
      method: 'POST',
      url: '/larva/login/keypair',
      data: JSON.stringify(data),
      contentType:  'application/json',
      processData: false
    }).done(function(response) {
      if (response.status === 'fail') {
        // Error handling
        toastr.error(response.message, 'Error occured!')
      }
      if (response.status === 'success') {
        $('#AUTH_SECTION').unblock();

        toastr.success(response.message, 'Success');
        window.location = '/drive/';
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
    $('#AUTH_SECTION .card').block({
      message: advancedBlocker('Decrypting keypair'),
      theme: true
    });

    var data = {};
    data.cHash = $( "#KEY_HASH").val();
    data.cSharing = $( "#KEY_SHARING").val();
    data.message = "message";

    $.ajax({
      method: 'POST',
      url: '/larva/decrypt',
      data: JSON.stringify(data),
      contentType:  'application/json',
      processData: false
    }).done(function(response) {
      if (response.status === 'fail') {
        // Error handling
        toastr.error(response.message, 'Error occured!')
        $('#AUTH_SECTION .card').unblock();
      }
      if (response.status === 'success') {
        // Error handling
        //toastr.success(response.message, 'Success!!');
        /* REPOST */
        var data2 = {};
        data2.key = response.key;
        data2.msg = 'yrdy';

        $.ajax({
          method: 'POST',
          url: '/larva/login/keypair',
          data: JSON.stringify(data2),
          contentType:  'application/json',
          processData: false
        }).done(function(response) {
          if (response.status === 'fail') {
            // Error handling
            toastr.error(response.message, 'Error occured!')
          }
          if (response.status === 'success') {
            $('#AUTH_SECTION .card').unblock();
            toastr.success(response.message, 'Success')
            window.location = '/drive/';
          }
        })
      }
    }).error(function(response) {
      toastr.error('Something went wrong.', 'Error occured!')
      $('#AUTH_SECTION .card').unblock();
    });
  });

  $('.BTN_REGISTER').on('click', function(event) {
    event.preventDefault();

    $('#AUTH_SECTION .card').block({
        message: advancedBlocker('Registering your account'),
        theme: true
    });

    var data = {};
    data.user = $('#USER_EMAIL').val();
    data.pass = $('#USER_PASS').val();
    data.message = "message";

    $.ajax({
      method: 'POST',
      url: '/larva/register',
      data: JSON.stringify(data),
      contentType:  'application/json',
      processData: false
    }).done(function(response) {
      if (response.status === 'fail') {
        // Error handling
        toastr.error(response.message, 'Error occured!')
        $('#AUTH_SECTION .card').unblock();
      }
      if (response.status === 'success') {
        $(".ui-widget-content p").html('<small>Check your email and activate your account.</small><br />Waiting...');
        interval = setInterval(function(){awaitActivation(data)},5000);
      }
    }).error(function(error) {
      $('#AUTH_SECTION .card').unblock();
    })
  });


  // TODO - throws error that acc is not activated but still logs in.
  $('.BTN_AUTH_LOGIN').on('click', function(event) {
    event.preventDefault();

    $('#AUTH_SECTION .card').block({
        message: advancedBlocker('Logging you in'),
        theme: true
    });


    /* TODO Use localstorage instead of cookie to set/get parameter if user has saved his keys.
    *  If the keys have been set, redirect to login below, else show page to encrypt and print out keys
    */

    var data = {};
    data.user = $('#EMAIL_LOGIN').val();
    data.pass = $('#PASSWORD_LOGIN').val();
    data.message = "message";

    $.ajax({
      method: 'POST',
      url: '/login',
      data: JSON.stringify(data),
      contentType:  'application/json',
      processData: false
    }).done(function(response) {
      if (response.status === 'fail') {
        // Error handling
        toastr.error(response.message, 'Error occured!')
        $('#AUTH_SECTION .card').unblock();
      }
      if (response.status === 'success') {
        window.location = '/';
      }

    }).error(function(error) {
      $('#AUTH_SECTION .card').unblock();
    })
  });
});


var interval;
function awaitActivation(data) {
  $.ajax({
    method: 'POST',
    url: '/larva/activate/',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false,
    complete: function ( resp) {

    }
  }).done(function(response) {
    if (response.status === 'fail') {
      // Error handling
      $(".ui-widget-content p").html('<small>Check your email and activate your account.</small><br />Waiting...');
      // toastr.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      toastr.success(response.message, 'Success');
      clearInterval(interval);
      $('#USERS_REG_SECTION').unblock();
      window.location = '/drive/';
    }
  })
}


// Adds custom wrapper around BluckUI
function advancedBlocker(input_message) {
  message = '<div class="loader">Loading...</div>';
  message += '<p>'+input_message+'</p>';
  return message;
}
