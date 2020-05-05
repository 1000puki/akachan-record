'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

$(function () {

  //日時取得・指定（BootStrap）
  var today = new Date();
  today.setDate(today.getDate());
  var yyyy = today.getFullYear();
  var mm = ("0"+(today.getMonth()+1)).slice(-2);
  var dd = ("0"+today.getDate()).slice(-2);
  var h = ("0"+today.getHours()).slice(-2);
  var mi = ("0"+today.getMinutes()).slice(-2);
  $('#date').val(yyyy+'-'+mm+'-'+dd);
  $('#time').val(h+':'+mi);

});
