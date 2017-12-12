
import "./admin.match.html";
import MatchingParticipants from '/imports/collections/matchingresults';
import AccommodationsT from '/imports/collections/accommodations';
import BusZones from '/imports/collections/buszone';
import "/imports/ui/components/loader/loader";

import jwt from 'jsonwebtoken';
import _ from "lodash";
import moment from "moment";
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'

//AccomodationT = new Mongo.Collection('accommodations');
var currentstep=0;
var arrComodations;
var mapReady;
const matchingParticipantsIndices = {
      'host': 1,
      'hostPhoneNumber':1,
      'Room':1,
      'GuestFirstName': 1,
      'GuestLastName': 1,
      'GuestPhonenumber': 1,
      'GuestEmail': 1,
      'University': 1,
      'Accommodation': 1
    };

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'}
});

// catches all exceptions on the server
raven.patchGlobal(client);

Template.AdminMatchSection.onCreated(function () {
  GoogleMaps.ready('map', function(map) {
    mapReady=map;
    //loadMap();
 });
  
  //alert(AccomodationT.find().count());
  // generate dummy content
  Meteor.startup(function () {
    Meteor.subscribe('MatchingParticipants.all');
    Meteor.subscribe("accommodations.all");
    Meteor.subscribe("buszones.all");

    //alert(MatchingParticipants.find().count());
    /*if (MatchingParticipants.find().count() === 0) {
        MatchingParticipants.insert({
          _id: '501',
          host: 'Anna2',
          hostPhoneNumber: '+3912737472',
          Room: '002',
          GuestFirstName: 'John2',
          GuestLastName: 'John2',
          GuestPhoneNumber: '+3927356562',
          GuestEmail: 'John@gmail.com',
          University: 'UNIBZ',
          Accommodation: 'Rigler'
        });
    }*/
    GoogleMaps.load({ v: '3', key: 'AIzaSyAPuyAsNeq6kyq0rXEjBDRfzHQYlQ2vrHw'});

  });
    Session.set('showMap',false);
    Session.set('displayMatchingList',false);
    Session.set('isLoading', false);

    let template = Template.instance();
    
    template.flattenedFields = new ReactiveVar(matchingParticipantsIndices);
    
    template.collection = new ReactiveVar({
        name: 'MatchingParticipants',
        instance: MatchingParticipants,
        flattened: template.flattenedFields.get(),
        searchQuery: '',
        filters: []
    });
  });

Template.AdminMatchSection.onRendered(function () {

});

Template.AdminMatchSection.helpers({
    showTheMapHelper:function(){
        return Session.get('showMap');
    },

    displayMatchingListHelper: function() {
      return Session.get('displayMatchingList');
    },

    isLoadingHelper: function(){
      return Session.get('isLoading');
    },
    mapOptions: function() {
      var myLatLng = {lat: 46.49502, lng:  11.33952};
      
      if (GoogleMaps.loaded()) {
        return {
          center: myLatLng,
          zoom: 14
        };
      }
    },
})

Template.AdminMatchSection.events({

    'click #matchingBus': function (event, template) {
      
      Meteor.subscribe("accommodations.all");
      //console.log(AccommodationsT.find({}, {fields: {'_id':1}}).count());

      arrComodations=AccommodationsT.find({}, {fields: {'_id':1}}).fetch();

      evalNextAccomodation();

      
    },
    
    'click #matchingParticipants': function(event,template) {
      //debugger;
      var width = 10;
      var id = setInterval(frame, 10);
      let collection = template.collection.get();
      Meteor.subscribe("MatchingParticipants.all", () => {
           console.log('load data', MatchingParticipants.find().fetch());
          setTimeout(() => {
              generateTable(template);
          }, 300);
      });
      function frame() {
          if (width >= 100) {
            clearInterval(id);
            Session.set('isLoading',false);
            Session.set('displayMatchingList',true);
          } else {
            Session.set('isLoading',true);
            width++; 
          }
      }
    },

})

//Function
function generateTable(template) {
  let collection = template.collection.get();
  let list = collection.instance.find().fetch();
  let schema = collection.instance.simpleSchema();

  let table = $('#MatchingParticipants_table');
  let tableHead = table.find('thead');
  let tableBody = table.find('tbody');
  let flattened = {};
  let count = 0;

  // set select value
  $('#collection_select').val('MatchingParticipants');

  // get flattened object
  flattened = collection.flattened;

  // remove all
  tableHead.children().remove();
  tableBody.children().remove();

  // HEADER
  tableHead.append("<tr>");
  tableHead.append("<th class='animated fadeIn'>#</th>");

  _.forEach(flattened, function (value, key) {
      // get labels from schema schema
      tableHead.append("<th class='animated fadeIn'>" + (_.isNull(schema) ? key : schema.label(key)) + "</th>");
  });
  //debugger;
  tableHead.append("</tr>");

  // BODY
  _.forEach(list, function (row) {
      tableBody.append("<tr class='animated fadeIn'>");

      // count column
      tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++count + "</th>");

      _.forEach(flattened, function (value, key) {
          let cell = deepFind(row, key);
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
      });
      tableBody.append("</tr>");
  });
}
function loadMap()
{
     Meteor.subscribe("accommodations.all");
     Meteor.subscribe("buszones.all");

     var arrComodations=AccommodationsT.find().fetch();
     var markers= [];
     for (var index = 0; index < arrComodations.length; index++) {
       var accommodation = arrComodations[index];
       var arrlatlng= accommodation.coordinates.split(",");
       //debugger;
       var objLatLng = {lat: parseFloat( arrlatlng[0]),lng: parseFloat( arrlatlng[1])};
       markers=getMultipleMarkersCant(objLatLng,accommodation.capacity ,markers); 
     }

     var markerCluster = new MarkerClusterer(mapReady.instance, markers,
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

      var pinColor = "FE7569";
      var pinImage = new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=bus|" + pinColor,
          new google.maps.Size(21, 34),
          new google.maps.Point(0,0),
          new google.maps.Point(10, 34));

      var arrBusZones= BusZones.find().fetch();
      debugger;
      for (var index = 0; index < arrBusZones.length; index++) {
        var bus = arrBusZones[index];
        var objLatLng = {lat: bus.lat ,lng: bus.lng };
        addMarker(objLatLng,mapReady.instance,(index+1).toString(),pinImage);
        var regionCoord=[];
        for (var j = 0; j < arrComodations.length; j++) {
          var accomodation = arrComodations[j];
          if(accomodation.busZone==bus._id)
          {
            var arrlatlng= accommodation.coordinates.split(",");
            var objLatLng = {lat: parseFloat( arrlatlng[0]),lng: parseFloat( arrlatlng[1])};
            regionCoord.push(objLatLng);
          }
          
        }
        addPolygon(mapReady.instance,regionCoord,'#FFCC00',0.8, 2,'#FFCC00', 0.5);
        
      }

}
function evalNextAccomodation()
{
  var clientResult = Meteor.apply('evaluateAccomodation',
      [arrComodations[currentstep]._id]
    , {returnStubValue: true},

      function(err, evalResult) {
        currentstep=currentstep+1;
        setProgress(currentstep,arrComodations.length );
        if(currentstep<arrComodations.length)
        {
          evalNextAccomodation();
        }else
        {

          loadMap();
        }
        
        //console.log("result");
        //Here have to update the progress of the bar
    }
    );
}
function setProgress(step, total)
{
  var elem = document.getElementById("myBar");   
  var width = (step/total)*100;
  
  if(width>=100){
    width = 100;
    Session.set('showMap',true);
  }         
    
  elem.style.width = width + '%';
  elem.innerHTML = (width.toPrecision(3) * 1  + '%') ;
    

    
  
}
function move(num, tot){
  var elem = document.getElementById("myBar");   
  var width = 0;
  //var id = setInterval(frame, 100);
  for(i=0; i < tot; i++){
    //alert(i) 
    Meteor.call('dummyAcc', i, function(error, result){
      if(error){
          console.log(error);
      } else {
        if (result){
           //alert("I'm in!")
        if (width >= 100) {
          clearInterval(id);
          //alert("Hi I'm an alert!")
          
          } else {
          width+=num; 
          if(width>=100){
            width = 100;
            Session.set('showMap',true);
          }         
            
          elem.style.width = width + '%';
          elem.innerHTML = (width.toPrecision(3) * 1  + '%') ;
            
            
          }
        }
        
      }
  });

    
  }
}
function getMultipleMarkersCant(LatLng, cant,markers)  
{
  

  for (var index = 0; index < cant; index++) {
    var marker = new google.maps.Marker({
      position: LatLng,
      label: '1'
    });
    markers.push(marker);
    
  }
  return markers;
}
function addMarker(LatLng,gmap,title, icon)
{
  
  var marker = new google.maps.Marker({
    position: LatLng,
    map: gmap,
    icon: icon,
    title: title
  });
}
function addPolygon (gmap, arrCoords, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity)
{
  
  // Construct the polygon.
  var bermudaTriangle = new google.maps.Polygon({
    paths: arrCoords,
    strokeColor: strokeColor ,
    strokeOpacity: strokeOpacity,
    strokeWeight: strokeWeight,
    fillColor: fillColor,
    fillOpacity: fillOpacity
  });
  bermudaTriangle.setMap(gmap);

}