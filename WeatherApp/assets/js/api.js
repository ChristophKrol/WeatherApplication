
const API_KEY = "af8890d750372a6404bd8b2b0c67452c";
// let lon = 12.101624;
// let lat = 49.0134;
let lon = localStorage.getItem("lon") || 12.101624;
let lat = localStorage.getItem("lat") || 49.0134;
let URL_WEATHER = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=${API_KEY}`; //&lang=de for german
let URL_FORECAST = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
let URL_AIR_POLLUTION = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
let chosenLocationLon;
let chosenLocationLat;
let userDate = new Date();


//Programming Buttons and UI

// get current location through button
$(document).ready(()=>{ // essential -> wait until document loaded
    $("#get-location-btn").on("click", ()=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(locationData => {
                localStorage.setItem("lat", locationData.coords.latitude);
                localStorage.setItem("lon", locationData.coords.longitude);
                location.reload();

            })
        }
        else{
            alert("Geolocation is not available");
        }
    })

    // search button
    $('#search-btn').click(()=>{
        $(".search-results").addClass("active-item");
    });

    //arrow-back button
    $("#back-arrow-btn").click(()=>{
        $(".search-results").removeClass("active-item");
    });


    // search city - query
    $("#searchQueryInput").on("input",() =>{
        let userInput = $("#searchQueryInput").val();
        console.log("Click");
        searchLocation(userInput)
   
    });

    // Send Input to API and show list
    function searchLocation(userInput){
        let q = userInput;
        let URL_SEARCH_LOCATION = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`;
        $.get(URL_SEARCH_LOCATION, data => {
            $(".results-list").empty();
            data.forEach(location => {
                let newListElement = $("<li>").addClass("result").append(
                    $("<div>").addClass("results").append(
                      $("<img>").attr("src", "assets/images/location.svg").attr("id", "location-icon").attr("alt", "Location"),
                      $("<div>").addClass("location-data").append(
                        $("<p>").addClass("location-name").text(location.name),
                        $("<p>").addClass("location-state-name").text(`${location.state}, ${location.country}`),
                      ),
                      $("<a>").addClass("location-link").attr("href", "#")
                    )
                )
                // Append on result list 
                $(".results-list").append(newListElement);
                    
            })
        });
    }

    //Display WeatherData of chosen Location
    $(".results-list").on("click", ".location-link", event => {

        //Get Exact Location for displaying right result (eg. Kansas)
        let location = $(event.target).siblings(".location-data").find(".location-name").text() + "," 
        + $(event.target).siblings(".location-data").find(".location-state-name").text();

        let URL = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`;

        $.get(URL, data => {
            localStorage.setItem("lat", data[0].lat);
            localStorage.setItem("lon", data[0].lon);
            window.location.reload();
            
        });
    });
    

        
        

    
      

});












// Format to Hour HH:MM
function convertIntoTime(timestamp) {
    let time = new Date(timestamp * 1000); // convert to milliseconds
    let hours = time.getHours();
    let minutes = time.getMinutes();

    //format time to string
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Format into Day dd MM 
function formatDate(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayOfWeek = daysOfWeek[date.getDay()]; // get the day of the week (0-6)
    const dayOfMonth = date.getDate(); // get the day of the month (1-31)
    const month = monthsOfYear[date.getMonth()]; // get the month (0-11)

    return `${dayOfWeek}, ${dayOfMonth} ${month} ${date.getFullYear().toString()}`;
}


/**
 * Get Current Weather Data
 */

$.get(URL_WEATHER, data =>{
    //console.log(data);
    let currentWeather, locationName, locationData, mainData, visibility;
    currentWeather = data.weather[0];
    locationName = data.name;
    locationData = data.sys;
    mainData = data.main;
    visibility = data.visibility;
    

    let currentWeatherData= {
        location: `${locationName}, ${locationData.country}`,
        date: userDate,
        temp: mainData.temp,
        weatherDescription: currentWeather.description,
        icon: currentWeather.icon,
    }
 
    $("#temperature-value").text(Math.round(currentWeatherData.temp) + " °C" );
    $("#description-value").text(currentWeatherData.weatherDescription);
    $("#date-value").text(formatDate(userDate));
    $("#location-value").text(currentWeatherData.location);
    $("#weather-icon").attr("src", `assets/images/weather_icons/${currentWeatherData.icon}.png`);


    let highlightData = {
        sunrise: locationData.sunrise,
        sunset: locationData.sunset,
        humidity: mainData.humidity,
        pressure: mainData.pressure,
        visibility: visibility,
        feelsLike: mainData.feels_like
    }


    $("#visibility-value").text(highlightData.visibility/1000 + " km");
    $("#humidity-value").text(highlightData.humidity + " %");
    $("#pressure-value").text(highlightData.pressure + " hPa");
    $("#feelsLike-value").text(Math.round(highlightData.feelsLike) + " °C");
    $("#sunrise-value").text(convertIntoTime(highlightData.sunrise));
    $("#sunset-value").text(convertIntoTime(highlightData.sunset));

});


/**
 * Get 5 Days and 24 Hour Forecast 
 */

$.get(URL_FORECAST, data => {

    
    let rawDataList = data.list;
    let allDatesList = [];          // Converted Dates

    rawDataList.forEach(data => {
        let timeStamp = data.dt;    // select TimeStamp
        let date = new Date(timeStamp * 1000); // convert to Date
        allDatesList.push(date);
    });                                                               
     

    // Defining a range of Hours --> 12:00 - 18:00
    let startHour = 12;
    let endHour = 18;
    let requiredDates =[];          // all needed Dates for 5 days forecast (first stamp included) 

    // include first date
    let lastAddedDate = allDatesList[0]; 
    requiredDates = [lastAddedDate];

    // search for other dates
    for(let i = 1; i < allDatesList.length; i++) {
        let date = allDatesList[i];
        let dateHour = date.getHours();
        let dateDate = date.getDate();

        if(dateHour >= startHour && dateHour <= endHour && dateDate !== lastAddedDate.getDate()) {
            requiredDates.push(date);
            lastAddedDate = date;
        }

    }


    // GET WEATHER DATA FROM TIMESTAMPS:

    //convert date back to timestamp and push to list
    requiredTimeStamps =  [];
    requiredDates.forEach(date => {
        let timeStamp = Math.floor(date.getTime() / 1000);
        requiredTimeStamps.push(timeStamp);
    });

    let = requiredData = [];

    for (const element of requiredTimeStamps) {
        rawDataList.forEach(data => {
            if(element === data.dt){
                requiredData.push(data);
            }
        });
    }

    // extract values from data-objects

    let icons = [];
    let temps = [];
    let dates = [];
    let days = [];

    requiredData.forEach(data => {
        icons.push(data.weather[0].icon);
        temps.push(Math.round(data.main.temp));

        // Format TimeStamp into date (dd MMM)
        let date = new Date(data.dt * 1000);
        let day = date.getDate();
        let month = date.toLocaleString('default', {month: 'short'});
        let formattedDate = `${day} ${month}`;
        dates.push(formattedDate)

        // Get Dayname of Date

        let dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayName = dayNames[date.getDay()];
        days.push(dayName);

    });

    // iterate through all arrays and change values in html
    for(let i = 0; i < icons.length; i++){
        $("#icon-" + i).attr("src", `assets/images/weather_icons/${icons[i]}.png`);  //Change Icon
        $("#temp-" + i).text(temps[i]); // Change temp
        $("#date-" + i).text(dates[i]); // Change Date
        $("#day-" + i).text(days[i]); // Change Day
        
    }

    /**
     * TODAYS FORECAST
     */

    // Extract first 8 entries and store it in list 

    let todaysWeatherList = rawDataList.slice(0, 8);

    for(let i = 0; i < todaysWeatherList.length; i++){

        //Insert time:
        let hour = convertIntoTime(new Date(todaysWeatherList[i].dt));
        $("#hour-" + i).text(hour);

        //Insert Icon
        let icon = todaysWeatherList[i].weather[0].icon;
        $("#weather-icon-" + i).attr("src", `assets/images/weather_icons/${icon}.png`);

        //Insert Termperature
        let temp = Math.round(todaysWeatherList[i].main.temp);
        $("#temp-val-" + i).text(temp + " °C");
    }
});


/**
 * GET AIR POLLUTION
 */

$.get(URL_AIR_POLLUTION, data => {
    let airData = data.list[0].components;
    //console.log(airData);

    // Make new Object with needed Data
    let requiredAirData = {
        co: airData.co,
        pm10: airData.pm10,
        pm25: airData.pm2_5,
        so2: airData.so2,
        no2: airData.no2,
        o3: airData.o3
    }

    // Insert data 
    $("#pm25").text(requiredAirData.pm25);
    $("#so2").text(Math.round(requiredAirData.so2 * 10)/10);
    $("#no2").text(Math.round(requiredAirData.no2 * 10)/10);
    $("#o3").text(Math.round(requiredAirData.o3 * 10)/10);


    // Air Quality Index
    let aqi = data.list[0].main.aqi;
    
    switch(aqi) {
        case 1:
            $("#aqi").addClass("quality-good");
            $("#aqi-text").text("Good");
            break;
        case 2:
            $("#aqi").addClass("quality-good");
            $("#aqi-text").text("Fair");   
            break;
        case 3:
            $("#aqi").addClass("quality-okay"); 
            $("#aqi-text").text("Moderate"); 
            break;
        case 4:
            $("#aqi").addClass("quality-bad");
            $("#aqi-text").text("Poor");   
            break;   
        case 5:
            $("#aqi").addClass("quality-bad");
            $("#aqi-text").text("Very Poor");   
            break;                
    }
    

});





























