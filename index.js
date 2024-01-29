const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab = userTab;
const API_key = "1278e18c24fb962eb45cad2d8dedc690";
currentTab.classList.add("current-tab");

getfromSessionStorage();    // as initially there might be coordinates present in the session storage, thus we'll call it initially so that if it's present, it will be presented.

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){   // this means that the searchForm is not visible now, and has to be made visible now, that's when it'll be considered switch.
            userContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            // mein pehle search vale tab pr tha, ab your weather tab visible karna hai.
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");   // jab switch karenge toh jo weather info hogi usse hatake, jo local storage pe coordinates stored hai unn coordinates ke basis pe show karna hai.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", ()=>{
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", ()=>{
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage.
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // if local coordinates are not found in the session storage, then that means we need to first grant the location, and thus make visible the grant location access container.
        grantAccessContainer.classList.add("active");
    }else{
        // if local coordinates are present, then use them to fetch data using API and display it.
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    // make the grant location access container invisible.
    grantAccessContainer.classList.remove("active");
    // make loader visible.
    loadingScreen.classList.add("active");

    // API CALL.
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);    // to render the data collected using API so as to display it on the UI.
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo){
    // firstly, we have to fetch weather info.
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in the UI elements.
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    if(navigator.geolocation){  // to check if it is supported by the browser.
        navigator.geolocation.getCurrentPosition(showPosition); // using the geolocation API
    }else{
        // show an alert for no geolocation support available.
    }
}

function showPosition(position){    // for extracting the latitude and longitude and store them in the session storage.
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

let searchInput = document.querySelector("[data-searchInput]"); // jo bhi city ka name hum search mein daalenge, usse fetch karne ke liye.
searchForm.addEventListener("submit",(e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;
    else{
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city){    // as we have to call API, thus use async function
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);    // for values in the userInfoContainer.
    }
    catch(err){

    }
}
