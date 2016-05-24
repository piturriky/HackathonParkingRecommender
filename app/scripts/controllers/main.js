'use strict';

/**
 * @ngdoc function
 * @name hackathonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hackathonApp
 */
angular.module('hackathonApp')
  .controller('main', function ($scope) {
    $scope.init = function(){

    };

    var map;

    function CallLod4All(location){
      var lfasparql = new LFASparql();
      var sparqlQuery = 'PREFIX ayto: <http://datos.santander.es#> ' +
        'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
        'SELECT ?info ?lat ?lon ?code WHERE{ ' +
        'BIND(1 AS ?code) . ' +
        '?p ayto:Nombre ?info. ' +
        '?p ayto:latitud ?lat. ' +
        '?p ayto:longitud ?lon. ' +
        '?p dc:identifier ?id. ' +
        'FILTER regex(str(?id), "APAR.*")' +
        'FILTER (xsd:double(?lat) >= ' + location.lat() + ' - 0.007 && xsd:double(?lat) <= ' + location.lat() + ' + 0.007). ' +
        'FILTER (xsd:double(?lon) >= ' + location.lng() + ' - 0.007 && xsd:double(?lon) <= ' + location.lng() + ' + 0.007) ' +
        '}';

      lfasparql.executeSparql({
        appID: 'xawsaykmcb',
        sparql: sparqlQuery,
        success: getResult,
        error: getError,
        timeout: 300
      });

      sparqlQuery = 'PREFIX ayto: <http://datos.santander.es#> ' +
        'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
        'SELECT ?info ?lat ?lon WHERE{ ' +
        '?p ayto:latWGS84 ?lat. ' +
        '?p ayto:lonWGS84 ?lon. ' +
        '?p ayto:TipoSenal ?info. ' +
        //'FILTER (xsd:double(?lat) >= ' + location.lat() + ' - 0.007 && xsd:double(?lat) <= ' + location.lat() + ' + 0.007). ' +
        //'FILTER (xsd:double(?lon) >= ' + location.lng() + ' - 0.007 && xsd:double(?lon) <= ' + location.lng() + ' + 0.007) ' +
        '}';

      lfasparql.executeSparql({
        appID: 'xawsaykmcb',
        sparql: sparqlQuery,
        success: getResult2,
        error: getError,
        timeout: 300
      });
    }

    function getResult(data) {
      for(var i = 0; i < data.length; i++) {
        var items = data[i];
        var code = parseInt(items.code.value);
        var lat = parseFloat(items.lat.value);
        var lon = parseFloat(items.lon.value);
        var info = items.info.value;

        PrintZone({'code':code,'lat':lat,'long': lon, 'info': info});
      }
    }
    function getError(xhr, status, error) {
      var errorJson = JSON.parse(xhr.responseText);
      console.log('Error occured: ' + status + '\nError: ' + error + '\nError detail: ' + errorJson.message);
    }

    function PrintZone(zone){
      console.log(zone.code + ' ' + zone.lat + ' ' + zone.long +' '+ zone.info);

      var label, title, image;

      switch (zone.code){
        case 1:// Parking subterrani
              label = 'P';
              title = 'Parking';

              image = {
                url: 'images/safe_image.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(20, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(0, 32)
              };

              break;
        // More cases
        default:
              label = '';
              title = '';
              break;
      }

      var marker = new google.maps.Marker({
        position: { lat: zone.lat, lng: zone.long },
        map: map,
        //label: label,
        title: title,
        icon: image
      });

      if(zone.code === 1){
        var contentString = '<div id="content">'+
          '<div id="siteNotice">'+
          '</div>'+
          '<h4 id="firstHeading" class="firstHeading">Parking: </h4>'+
          '<div id="bodyContent">'+
          '<p>'+ zone.info +'</p>' +
          '</div>'+
          '</div>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      }
      markers.push(marker);
    }

    function getResult2(data) {

      for(var i = 0; i < data.length; i++) {
        var items = data[i];
        var lat = parseFloat(items.lat.value);
        var lon = parseFloat(items.lon.value);

        heatmaps.push(new google.maps.LatLng(lat,lon));
      }

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmaps,
        map: map
      });
      heatmap.set('dissipating',true);
      heatmap.set('radius',20);
      heatmap.set('maxIntensity',15);

    }

    $scope.getZones = function(map_,location) {
      map = map_;
      map.panTo(location);
      map.setZoom(16);

      var marker = new google.maps.Marker({
        position: location,
        map: map,
      });

      CallLod4All(location);
    };
  });
