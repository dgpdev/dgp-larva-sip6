/**
 * Created by D3 on 18/10/2017
 */

$(document).ready(function() {
  var url = $(location).attr('href'),
  parts = url.split("/"),
  last_part = parts[parts.length-1];

  //alert(last_part);

  $.ajax({
    method: 'GET',
    url: 'http://alpha.digipulse.io:8080/activations/'+last_part,
    contentType:  'application/json',
    processData: false
  }).done(function(response) {
    if (response.error) {
      console.log(response);
    }
    if (response.activated == true) {
      $('.verification-progress').fadeOut('fast', function() {
        $('.verification-complete').fadeIn('fast');
      });
    } else {
      toastr.error('Something went wrong with email activation', 'Error occured!');
    }
  }).fail(function(error) {
    toastr.error('Something went wrong with email activation', 'Error occured!');
    console.log("Try again champ!" + data);
  })
});


// Extract GET param from the string
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
