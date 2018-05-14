var foodArray = ["drink", "coffee", "fastfood", "vegan", "asian", "steak"];
var foodIconArray =["assets/images/00.png","assets/images/01.png","assets/images/02.png","assets/images/03.png","assets/images/04.png","assets/images/05.png"];
var addressGeometryLat = 0;
var addressGeometryLong = 0;
var cityName;

var buttonHooker = $("#foodButtonWrapper");  // create a variable to hook all buttons ad future user input append

function renderButtons(arr){             // create a function to render current game array as  buttons
    for (var i = 0; i <arr.length; i++){

        var newDiv =$("<div>").attr("class","imgWrap jumbotron col-md-3 col-sm-4 col-xs-6");
        var newImg = $("<img>").attr("src", foodIconArray[i]);
        newImg.attr("class","imgButtons");
        // newImg.attr("data-hover",foodIconArrayHover[i]);
        newImg.attr("data-foodtype",foodArray[i]);
        
        newImg.attr("data-foodindex",i);        // added

        var newP = $("<p>").text(foodArray[i]);
        newP.attr("class","text-center");
        newDiv.append(newImg,newP);
        buttonHooker.append(newDiv);
    }
}

//define a variable to capture user click and store button's value into the var
var currentQueryVar;
$(document).on("click", "#searchButton", function(event){
    event.preventDefault();

    currentQueryVar = $("#searchField").val();
    console.log(currentQueryVar);
    var currentURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + currentQueryVar +"key=AIzaSyBGnYxlsr-8atPpbWbMsM2crsD-kah9JAI";
    //*************  Google Geo API ***************
    $.ajax({
        url:currentURL,
        method: "GET"
    }).then(function(response){
        //log full response
        console.log(response);
        // $("#contentContainer").text(JSON.stringify(response));

        //formated address
        // console.log("the formatted address is: " + response.results[0].formatted_address)
        //address geometry
        addressGeometryLat = response.results[0].geometry.location.lat
        console.log("the geometry of location latitude is: " + response.results[0].geometry.location.lat)
        addressGeometryLong = response.results[0].geometry.location.lng
        console.log("the geometry of location longitude is: " + response.results[0].geometry.location.lng)
        //we are going to use the cityName variable to use in weather API AJAX
        cityName = response.results[0].address_components[3].long_name
        console.log("the name of the city is: " + response.results[0].address_components[3].long_name)
    
        //call weather api to extract weather information using cityname as parameter
        var APIKey = "ae1eea3fe56f73fb07fdc6e4480bc31b";
        // Here we are building the URL we need to query the database passing th cityName from geoapi call to this inner ajax call
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?" +
          "q="+cityName+"&units=imperial&appid=" + APIKey;


        //*************  OpenWeatherMap API ***************
        // Here we run our AJAX call to the OpenWeatherMap API
        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function(response) {
            // Log the queryURL
            console.log(queryURL);
            // Log the resulting object
            console.log(response);
            // Transfer content to HTML
            var weatherHooker = $("#cityWeather"); // get hold of the cityweaher class container prepare to append to this div
            weatherHooker.empty();  // empty the contents inside this container to avoid overlapping append
            var newCity = $("<div>").attr("class", "city text-center");  // create city div
            var newTemp = $("<div>").attr("class", "temp text-center");    // create temp div
            var newThermo = $("<img>").attr("src", "assets/images/thermo.png");
            newThermo.attr("width","25px");
            newTemp.append(newThermo);
            weatherHooker.append(newCity,newTemp);


            $(".city").html("<h5>" + response.name + " Weather </h5>");
            // $(".wind").text("Wind Speed: " + response.wind.speed);
            // $(".humidity").text("Humidity: " + response.main.humidity);
            $(".temp").prepend($("<span>").text("Temperature (F) " + response.main.temp));
            // Log the data in the console as well
            // console.log("Wind Speed: " + response.wind.speed);
            // console.log("Humidity: " + response.main.humidity);
            // console.log("Temperature (F): " + response.main.temp);
          });
        //*************  OpenWeatherMap API ends here ***************
        // Render food type buttons to allow user to choose food
        $("#foodButtonWrapper").empty();
        renderButtons(foodArray);   //render food array button to html page

    });
});
        renderButtons(foodArray);   //for debug testing use, delete before publish render food array button to html page


//user click the imgButtons calling google place api

// testing google own method
var map;
// var infowindow;

function initMap(someVar) {    // fill the the blank to pass some variable here
  var pyrmont = {lat: 37.4228775, lng: -122.085133};  //fill the the blank where to pass addressGeometryLat addressGeometryLong?

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 15
  });

//   infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: pyrmont,
    radius: 3500,
    type: ['restaurant'],
    keyword:'steak',  //fill in the the blank where to use someVar??
  }, callback);
}

    
// To calculate distance between two coordinates 
function calcDistance(pointAx, pointAy, pointBx, pointBy) {

    var xDistanceDegree = pointBx-pointAx 
    var yDistanceDegree = pointBy-pointAy
    // console.log(xDistance +" " + yDistance);

    // DistanceDegree values are in latitude and longitude. Need to convert from degrees to miles. 68.703 represents 1 degree in miles
    // Calculating the hypotenuse of a right triangle

    var zDistanceMiles = 68.703*(Math.sqrt((xDistanceDegree * xDistanceDegree) + (yDistanceDegree * yDistanceDegree)));
    // console.log(zDistance);

    return zDistanceMiles
}



function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    $("#contentContainer").empty();  // empty out the table area in a new circle
    renderTableHeader();  //render table data
    for (var i = 0; i < results.length; i++) {
        var place = results[i];  //travese through a list of returned restaurant objects
        console.log(place.name); //restaurant name
        // console.log(place.place_id);
        console.log(place.rating);      //restaurant rating
        console.log(place.vicinity);    //restaurant address
        console.log("lat = " +place.geometry.location.lat());   //restaurant lat info
        console.log("lon = " +place.geometry.location.lng());   //restaurant long info
        console.log("Open? "+place.opening_hours.open_now);  //restaurant still opening or not

        // var types = String(place.types);
        // types = types.split(",");
        // console.log(types[0]);
        renderTableData(i+1, place.name, place.vicinity,"not sure yet", place.rating, place.opening_hours.open_now);

    }
  }
}

////******/

//user click the imgButtons calling google place api

var foodQueryVar;

$(document).on("click", ".imgButtons", function(){

    foodQueryVar = $(this).attr("data-foodtype");
    console.log(foodQueryVar);
    initMap();  // fill in the blank what should go inside initMap function?

});


//deal with hover effect 
// reference link https://www.w3schools.com/jquery/event_hover.asp
$(document).on("mouseover", ".imgButtons", function(){
    $(this).hover(function(){$(this).attr("src","assets/images/0"+$(this).attr("data-foodindex") +"i.png")},
                  function(){ "..."});  //fill in the blank here, what should be inside the outer function?

});

// separate table header render from tbody data.

function renderTableHeader(){
    var tableHooker = $("#contentContainer");
    var table = $("<table>").attr("class","table table-striped table-dark");
    var thead = $("<thead>").html("<tr><th scope=\"col\"></th><th scope=\"col\">Name of Place</th><th scope=\"col\">Address</th><th scope=\"col\">Appx Distance (Miles)</th><th scope=\"col\">Rating (Max 5.0)</th><th scope=\"col\">Open</th></tr>");
    var tbody = $("<tbody>").attr("id","table-content"); // define tbody id hooker to make future data append easier
    table.append(thead,tbody);
    tableHooker.append(table);
}

// define a recallable table body render to fill in the table data
function renderTableData(a,b,c,d,e,f){
    var tableContentHooker = $("#table-content");
    var tdata = $("<tr>").html("fill in here ");        //fill in the blank using linh's table and line 178 as reference point 
                    // <tr>
                    //     <th scope="row">1</th>
                    //     <td>Cafe</td>
                    //     <td>Nob Hill</td>
                    //     <td>555-5555</td>
                    //     <td>Nob Hill</td>
                    //     <td>555-5555</td>
                    // </tr>

    tableContentHooker.append(tdata);

}