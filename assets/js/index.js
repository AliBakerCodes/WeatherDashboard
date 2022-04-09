// Query Selectors
var searchFormEl = document.querySelector('#search-card');
var searchInputEl = document.querySelector('#search');
var currentCityEl = document.querySelector('#currentCity')
var cityHeaderEl = document.querySelector('#city-header');
var currentTempEl=document.querySelector('#temp');
var currentWindEl=document.querySelector('#wind');
var currentHumidityEl=document.querySelector('#humidity');
var currentUVEl=document.querySelector('#uv');
var forcastEl=document.querySelector('#forcast');
var searchHistoryEL=document.querySelector('#search-history')
var weatherSearchHistory;
// Variables and objects
const GEO_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const WEATHER_URL='https://api.openweathermap.org/data/2.5/onecall?lat='
const API_KEY='c78fe5213b32be1723e81e7b35ca6546'

//Object Constructor
function searchObj(name, lat, lon) {
  this.name = name;
  this.lat = lat;
  this.lon = lon;
}
//Init function on page load
function init () {
getItem();
console.log("call history");
renderSearchHistory();

};

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
  var weatherString=`${WEATHER_URL}${currentSearch.lat}&lon=${currentSearch.lon}&units=imperial&appid=${API_KEY}`
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

var renderSearchHistory= function() {
  searchHistoryEL.innerHTML="";
  weatherSearchHistory.forEach(function (ele) {
    var newButtonDiv = document.createElement("div");
    newButtonDiv.innerHTML =
      `<button type="submit" class="btn btn-primary btn-block mb-3 history" data-lat="${ele.lat}" data-long="${ele.lon}" data-name="${ele.name}">${ele.name}</button>`;
    searchHistoryEL.append(newButtonDiv);  
  });
}

function renderWeather (results) {
  console.log("render")
  //Render current day's results
  var currentDay=results.current
  var uvi=results.current.uvi
  const ICON_URL="http://openweathermap.org/img/wn/"
  cityHeaderEl.innerHTML=`${currentSearch.name} (${moment.unix(currentDay.dt).format("MM/DD/YYYY")}) <img src="${ICON_URL}${currentDay.weather[0].icon}@2x.png"/>`;
  currentTempEl.textContent=results.current.temp;
  currentWindEl.textContent=results.current.wind_speed;
  currentHumidityEl.textContent=results.current.humidity;
  currentUVEl.innerHTML=`UV Index: ${uvi}`;
  
  var severity; //choose the severity class bassed on the UV Index Scale
  switch (true) {
    case uvi < 3:
        severity ="low"
        break;
    case uvi >= 3 && uvi<=5:
        severity ="moderate"
        break;
    case uvi ==6 || uvi==7:
        severity ="high"
        break;
    case uvi >= 8 && uvi<=10:
        severity ="veryHigh"
        break;
    case uvi >10:
        severity ="Extreme"
        break;              
  };
  currentUVEl.classList.add(severity);

  forcastEl.innerHTML="";
  for(i=0;i<5;i++){ //Render the 5 day Forcast cards
    var day = results.daily[i];
    console.log(day)
    var date = moment.unix(day.dt).format("MM/DD/YYYY")
    console.log(date)
    var divEL=document.createElement('div')
    divEL.innerHTML = `
    <div class="card mr-3 bg-dark text-light forcast-card">
    <div class="card-body">
      <h5 class="card-title">${date}</h5>
      <ul id="currentConditions">
        <li><img src="${ICON_URL}${day.weather[0].icon}@2x.png"/></li>
        <li>Hi: ${day.temp.max}°F</li>
        <li>Low: ${day.temp.max}°F</li>
        <li>Wind: ${day.wind_speed} mph</li>
        <li>Humidity: ${day.humidity}%</li>
      </ul>
    </div>
  </div>`
  forcastEl.append(divEL);
  }
  storeItem();
    renderSearchHistory();
}
function search(searchString) {
  console.log("Searching...");
  // createObj(searchString);
  currentSearch= new searchObj (searchInputEl.value, "","") 
  getGeo(searchString);
  console.log(currentSearch)
  
  
}

function storeItem() {
  //Json stringify item and store to localStorage
  var duplicate=false;
  weatherSearchHistory.forEach(function (search,index){ //check for dupes
    if(currentSearch.name ==weatherSearchHistory[index].name) {
      duplicate=true;
    }
  });
  if(duplicate==false){
    console.log("NO dupe found")
    weatherSearchHistory.push(currentSearch);
    localStorage.setItem("weatherSearchHistory", JSON.stringify(weatherSearchHistory));
  }
}

function getItem() {
  //Check if there is a stored already. 
  weatherSearchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));
  if (!weatherSearchHistory) {//if not, initialize Globally
    weatherSearchHistory = [];
  }
}
searchFormEl.addEventListener('submit', formSubmitHandler);
init();
