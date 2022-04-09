// Query Selectors
var searchFormEl = document.querySelector('#search-form');
var searchInputEl = document.querySelector('#search');
var currentCityEl = document.querySelector('#currentCity')
var cityHeaderEl = document.querySelector('#city-header');
var currentTempEl=document.querySelector('#temp');
var currentWindEl=document.querySelector('#wind');
var currentHumidityEl=document.querySelector('#humidity');
var currentUVEl=document.querySelector('#uv');
var forcastEl=document.querySelector('#forcast');

// Variables and objects
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const WEATHER_URL='https://api.openweathermap.org/data/2.5/onecall?lat='
const API_KEY='c78fe5213b32be1723e81e7b35ca6546'
function searchObj(name, lat, lon) {
  this.name = name;
  this.lat = lat;
  this.lon = lon;
}

// Function Junction
var formSubmitHandler = function (event) {
  event.preventDefault();
  var searchString = searchInputEl.value.replace(" ", "+");
  searchString =searchString.trim();
  console.log("Search String: " + searchString)
  search(searchString)
};

function createObj (name){
  currentSearch= new searchObj (name, "","") 
  console.log("Search object Create:")
  console.log(currentSearch);
}

var getGeo = async function(geo) {
  var geoString=`${GEO_URL}${geo}&limit=5&appid=${API_KEY}`
  console.log("geoString: " + geoString)
  let results;
  results = await getApi(geoString);
  if (!results) return;
    currentSearch["lat"]=results[0].lat
    currentSearch["lon"]=results[0].lon
    console.log("currentSearch Object post Geo:")
    console.log(currentSearch);
    getWeather();
}

var getWeather = async function() {
  console.log(currentSearch);
  var weatherString=`${WEATHER_URL}${currentSearch.lat}&lon=${currentSearch.lon}&appid=${API_KEY}`
  console.log("weatherString: " + weatherString)
  let results;
  results = await getApi(weatherString);
  console.log(results)
  if (!results) return;
  renderWeather(results);
  

}

var getApi = function(apiUrl) {
  return fetch(apiUrl).then(function (response) {
    if (response.ok) {
     const data = response.json();
      if (data.length == 0) {
        window.alert("No results returned");
        return;
      } else {
        // console.log(data)
        return data;
      }
    } 
  });
};

function renderWeather (results) {
  console.log("render")
  cityHeaderEl.textContent=currentSearch.name;
  currentTempEl.textContent=results.current.temp;
  currentWindEl.textContent=results.current.wind_speed;
  currentHumidityEl.textContent=results.current.humidity;
  currentUVEl.textContent=results.current.uvi;

  for(i=0;i<5;i++){
    var day = results.daily[i];
    console.log(day)
    var date = moment.unix(day.dt).format("mm/dd/yyyy")
    console.log(date)
    var divEL=document.createElement('div')
    divEL.innerHTML = `
    <div class="card m-3 bg-dark text-light forcast-card" style="width: 10rem">
    <div class="card-body">
      <h5 class="card-title">${day}</h5>
      <ul id="currentConditions">
        <li>icon</li>
        <li>Temp:${day.temp.max}</li>
        <li>Wind:${day.wind_speed}</li>
        <li>Humidity:${day.humidity}</li>
      </ul>
    </div>
  </div>`
  forcastEl.append(divEL);
  }
}
function search(searchString) {
  console.log("Searching...");
  // createObj(searchString);
  currentSearch= new searchObj (searchString, "","") 
  getGeo(searchString);
  console.log(currentSearch)
  
  
}
searchFormEl.addEventListener('submit', formSubmitHandler);