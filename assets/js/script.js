//variable that stores the Weather API key
var city = "";

var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-button");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];

function find(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

var APIKey = "bd399b7e3dde0607adabc020a708e2e0";

function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}

function currentWeather(city) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    //Parsing response to display the city name, current weather
    //as well as the date and weather icon
    console.log(response);

    var weathericon = response.weather[0].icon;
    var iconurl =
      "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

    var date = new Date(response.dt * 1000).toLocaleDateString();
    $(currentCity).html(
      response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
    );

    //Convert temp to fahrenheit
    var fTemp = (response.main.temp - 273.15) * 1.8 + 32;
    $(currentTemperature).html(fTemp.toFixed(2) + "&#8457");
    //Humidity display
    $(currentHumidity).html(response.main.humidity + "%");
    //Convert windspeed to MPH
    var ws = response.wind.speed;
    var windsmph = (ws * 2.237).toFixed(1);
    $(currentWSpeed).html(windsmph + "MPH");
    //UVIndex display

    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if (response.cod == 200) {
      sCity = JSON.parse(localStorage.getItem("cityname"));
      console.log(sCity);
      if (sCity == null) {
        sCity = [];
        sCity.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(sCity));
        addToList(city);
      } else {
        if (find(city) > 0) {
          sCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(sCity));
          addToList(city);
        }
      }
    }
  });
}

// Below is the function to return the UV index from the Openweather API
function UVIndex(long, lat) {
  var uvURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    lat +
    "&lon=" +
    long;
  $.ajax({
    url: uvURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

//Below is the function to display the 5 day forecast for the Openweather API
function forecast(cityid) {
  var queryforecastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryforecastURL,
    method: "GET",
  }).then(function (response) {
    var interval = Math.floor(response.list.length / 5);
    for (i = 0; i < 5; i++) {
      var index = i * interval;
      var date = new Date(response.list[index].dt * 1000).toLocaleDateString();
      var iconcode = response.list[index].weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var kTemp = response.list[index].main.temp;
      var fTemp = ((kTemp - 273.5) * 1.8 + 32).toFixed(2);
      var humidity = response.list[index].main.humidity;

      var ws = response.list[index].wind.speed;
      var windsmph = (ws * 2.237).toFixed(1);

      $("#date" + (i + 1)).html(date);
      $("#img" + (i + 1)).html("<img src=" + iconurl + ">");
      $("#temp" + (i + 1)).html(fTemp + "&#8457");
      $("#humidity" + (i + 1)).html(humidity + "%");
      $("#wind-speed" + (i + 1)).html(windsmph + " MPH");
    }
  });
}
//Adding passed city into search history
function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}
// Displaying searches when the list group item is clicked in search history
function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    searchCity.val(city);
    currentWeather(city);
  }
}

// The render function
function loadlastcity() {
  $("ul").empty();
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}

//Clear the search history from the page
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastcity);
$("#clear-button").on("click", clearHistory);
