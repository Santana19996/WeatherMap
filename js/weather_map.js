$(document).ready(function () {
    "use strict";
    var mapLong = -98.4916;
    var mapLat = 29.4252;
    updateWeather(mapLat, mapLong);


    function updateWeather(latitude, longitude) {
        var getFiveDayForecast = $.get("https://api.openweathermap.org/data/2.5/onecall", {
            APPID: OpenWeatherAPIKey,
            lat: latitude,
            lon: longitude,
            units: "imperial",
        });

        //5 day forecast
        getFiveDayForecast.done(function (weatherConditions) {
            var daily = weatherConditions.daily;
            $(".weather-card-container").html("");

            for (var i = 0; i < 5; i++) {
                makeCard(daily[i]);
            }
        });
    }


    //creating cards dynamically
    function makeCard(weatherConditions) {
        var weatherCards = "";

        //Converting time to be readbale
        var Time = weatherConditions.dt;
        var milliseconds = Time * 1000;
        var dateObject = new Date(milliseconds);
        var dateFormat = dateObject.toLocaleString();
        var date = dateFormat.split(",");
        date = date[0];


        weatherCards += `<div class='d-inline-block'>
         <div class='card m-2' style='width: 18rem;'>
         <div class='card-header text-center'> ${date} </div>
         <ul class='list-group list-group-flush'>
         <li class='list-group-item text-center'>
         <strong>  ${weatherConditions.temp.max}  &#8457; /   ${weatherConditions.temp.min}   &#8457;</strong><br>
         <img src='http://openweathermap.org/img/w/${weatherConditions.weather[0].icon}.png' alt='${weatherConditions.weather[0].description} image'>
         <li class='list-group-item'>Description: <strong> ${weatherConditions.weather[0].description}</strong><br><br>
         Humidity: <strong>${weatherConditions.humidity}  </strong></li>
         <li class='list-group-item'>Wind: <strong> ${weatherConditions.wind_speed} </strong></li>
         <li class='list-group-item'>Pressure: <strong>  ${weatherConditions.pressure}  </strong></li>
         </ul>
         </div>
         </div>`


        $(".weather-card-container").append(weatherCards);
    }


    //Mapbox Token
    mapboxgl.accessToken = mapBoxAPIKey;

    //Customizing the Map
    var mapOptions = {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [mapLong, mapLat], // starting position [lng, lat]
        zoom: 12 // starting zoom
    }

    //Creating the Map
    var map = new mapboxgl.Map(mapOptions);


    //Custom marker
    var markerOptions = {
        draggable: true
    };


    var marker = new mapboxgl.Marker(markerOptions)
        .setLngLat([mapLong, mapLat])
        .addTo(map);

    function onDragEnd() {
        var lngLat = marker.getLngLat();
        reverseGeocode(lngLat, mapBoxAPIKey).then(function (result) {
            let city = result.split(",");
            $('#currentCity').html('Current City: ' + (city[city.length - 3]));
            marker
                .setLngLat([mapLong, mapLat])
            map.flyTo({
                center: [mapLong, mapLat],
                essential: true
            })
        });
        mapLong = lngLat.lng
        mapLat = lngLat.lat
        updateWeather(mapLat, mapLong);
    }

    marker.on('dragend', onDragEnd);
    updateWeather();

    $('#button1').click(function (event) {
        updatedInfo()
        event.preventDefault();
        var location = $('#search').val();
        relocate(location)
        $('#currentCity').html('Current City: ' + location[0].toUpperCase() + location.substr(1));
        geocode(location, mapBoxAPIKey).then(function (area) {
            mapLong = area[0];
            mapLat = area[1];
            marker
                .setLngLat([mapLong, mapLat])
            map.flyTo({
                speed: 0.5,
                curve: 1,
                center: [mapLong, mapLat],
                essential: true
            })
        })
        updateWeather()
    })

    function relocate(location) {
        geocode(location, mapboxgl.accessToken).then(function (result) {
            let latitiude = result[0];
            let longitude = result[1];
            map.flyTo({
                center: [
                    latitiude,
                    longitude
                ],
                zoom: 10,
                essential: true
            });
            marker.setLngLat(result);
            updatedInfo(longitude, latitiude);
            updateWeather(longitude, latitiude)
        })
    };

    function updatedInfo(lat, long) {
        $.get(`https://api.openweathermap.org/data/2.5/onecall`, {
            appid: OpenWeatherAPIKey,
            lat: lat,
            lon: long,
            units: "imperial"
        }).done(function (data) {
        })
    };

});


