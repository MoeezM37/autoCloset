debugger;

const API_KEY = '8a2706007ccb66f6b839422a95eac453';

const dateNow = new Date();
const monthNow = dateNow.getMonth() + 1;
const monthNameNow = dateNow.toLocaleString('default', { month: 'long' });
const dayNow = dateNow.getDate();
const dayNameNow = dateNow.toLocaleString('default', { weekday: 'long' });
const yearNow = dateNow.getFullYear();
const hourNow = dateNow.getHours();
const AMPM = hourNow >= 12 ? 'PM' : 'AM'
const minuteNow = String(dateNow.getMinutes()).padStart(2, '0');
const hourAMPMNow = hourNow == 0 ? 12 : hourNow % 12;
const monthDayNow = monthNow * 100 + dayNow;

async function getWeather(location) {
	
	var locationData;
	var locationLat;
	var locationLon;
	
	try {
		showLoading();
		const locationResponse = await fetch(
			`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`
		);
		
		if (!locationResponse.ok) throw new Error('City not found');
		locationData = await locationResponse.json();
	} catch (error) {
		showError(error.message);
	}
	
	locationLat = locationData[0].lat;
	locationLon = locationData[0].lon;
	
	try {
		showLoading();
		const weatherResponse = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${locationLat}&lon=${locationLon}&units=metric&appid=${API_KEY}`
		);
		
		if (!weatherResponse.ok) throw new Error('Weather service unavailable');
		const weatherData = await weatherResponse.json();
		
		const forecastResponse = await fetch(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${locationLat}&lon=${locationLon}&units=metric&cnt=6&appid=${API_KEY}`
		);
		
		if (!forecastResponse.ok) throw new Error('Weather service unavailable');
		const forecastData = await forecastResponse.json();
		
		showResult(weatherData, forecastData);
		
	} catch (error) {
		showError(error.message);
	}
	
}

function getCurrentLocation() {
	if (!navigator.geolocation) {
		showError('Geolocation not supported');
		return;
	}
	
	showLoading();
	navigator.geolocation.getCurrentPosition(
		async position => {
			try {
				debugger;
				const weatherResponse = await fetch(
					`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${API_KEY}`
				);
				const weatherData = await weatherResponse.json();
				
				const forecastResponse = await fetch(
					`https://api.openweathermap.org/data/2.5/forecast?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&cnt=6&appid=${API_KEY}`
				);
				const forecastData = await forecastResponse.json();
				
				showResult(weatherData, forecastData);
				
			} catch (error) {
				showError('Failed to get weather');
			}
		},
		error => showError('Location access denied')
	);
}

function showResult(weather, forecast) {
	
	const currentTemp = weather.main.temp;
	const feelsLikeTemp = weather.main.feels_like;
	const weatherTextMain = weather.weather[0].main;
	const weatherTextDesc = weather.weather[0].description;
	const weatherIcon = weather.weather[0].icon;
	const locationName = weather.name;
	
	const forecastTemp = [];
	const forecastIcon = [];
	const forecastFeelsLike = [];
	const forecastTime = [];
	var clothesTemp = 0;
	var forecastCount = Math.floor((24 - hourNow) / 3);
	
	for (let i = 0; i < forecastCount; i++) {
		forecastTemp.push(forecast.list[i].main.temp);
		forecastIcon.push(forecast.list[i].weather[0].icon);
		forecastFeelsLike.push(forecast.list[i].main.feels_like);
		forecastTime.push(forecast.list[i].dt_txt);
		
		clothesTemp = clothesTemp + forecastFeelsLike[i];
	}
	
	clothesTemp = clothesTemp / forecastCount;
	
	const clothes = getClothingRecommendation(clothesTemp, monthDayNow, weatherTextMain);
	
	document.getElementById('currentWeatherDiv').style.visibility = "visible";
	document.getElementById('locationDiv').innerHTML = `${locationName}`;
	document.getElementById('dateDiv').innerHTML = `${dayNameNow}, ${monthNameNow} ${dayNow}, ${yearNow}<br>${hourAMPMNow}:${minuteNow} ${AMPM}`;
	document.getElementById('weatherTextDiv').innerHTML = `<p id="weatherTextMain">${weatherTextMain}</p><p id="weatherTextDesc">${weatherTextDesc}</p>`;
	document.getElementById('currentTemp').innerHTML = `<b>${currentTemp.toFixed(1)}</b>`;
	document.getElementById('currentWeatherIcon').src = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
	document.getElementById('currentWeatherIcon').style.visibility = "visible";
	document.getElementById('feelsLikeTempDiv').innerHTML = `Feels like ${feelsLikeTemp.toFixed(1)}&deg`;
	
	document.getElementById('clothesText').innerHTML = `${clothes}`;
	
	document.getElementById('forecastDiv').style.visibility = "visible";
	document.getElementById('forecastTempNow').innerHTML = `${currentTemp.toFixed(1)}&deg`;
	document.getElementById('forecastIconNow').src = "https://openweathermap.org/img/wn/" + weatherIcon + ".png";
	document.getElementById('forecastFeelsLikeNow').innerHTML = `Feels like ${feelsLikeTemp.toFixed(1)}&deg`;
	document.getElementById('forecastTemp3hr').innerHTML = `${forecastTemp[0].toFixed(1)}&deg`;
	document.getElementById('forecastIcon3hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[0] + ".png";
	document.getElementById('forecastFeelsLike3hr').innerHTML = `Feels like ${forecastFeelsLike[0].toFixed(1)}&deg`;
	document.getElementById('forecastTime3hr').innerHTML = `${new Date(forecastTime[0]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
	document.getElementById('forecastTemp6hr').innerHTML = `${forecastTemp[1].toFixed(1)}&deg`;
	document.getElementById('forecastIcon6hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[1] + ".png";
	document.getElementById('forecastFeelsLike6hr').innerHTML = `Feels like ${forecastFeelsLike[1].toFixed(1)}&deg`;
	document.getElementById('forecastTime6hr').innerHTML = `${new Date(forecastTime[1]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
	document.getElementById('forecastTemp9hr').innerHTML = `${forecastTemp[2].toFixed(1)}&deg`;
	document.getElementById('forecastIcon9hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[2] + ".png";
	document.getElementById('forecastFeelsLike9hr').innerHTML = `Feels like ${forecastFeelsLike[2].toFixed(1)}&deg`;
	document.getElementById('forecastTime9hr').innerHTML = `${new Date(forecastTime[2]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
	document.getElementById('forecastTemp12hr').innerHTML = `${forecastTemp[3].toFixed(1)}&deg`;
	document.getElementById('forecastIcon12hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[3] + ".png";
	document.getElementById('forecastFeelsLike12hr').innerHTML = `Feels like ${forecastFeelsLike[3].toFixed(1)}&deg`;
	document.getElementById('forecastTime12hr').innerHTML = `${new Date(forecastTime[3]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
	document.getElementById('forecastTemp15hr').innerHTML = `${forecastTemp[4].toFixed(1)}&deg`;
	document.getElementById('forecastIcon15hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[4] + ".png";
	document.getElementById('forecastFeelsLike15hr').innerHTML = `Feels like ${forecastFeelsLike[4].toFixed(1)}&deg`;
	document.getElementById('forecastTime15hr').innerHTML = `${new Date(forecastTime[4]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
	document.getElementById('forecastTemp18hr').innerHTML = `${forecastTemp[5].toFixed(1)}&deg`;
	document.getElementById('forecastIcon18hr').src = "https://openweathermap.org/img/wn/" + forecastIcon[5] + ".png";
	document.getElementById('forecastFeelsLike18hr').innerHTML = `Feels like ${forecastFeelsLike[5].toFixed(1)}&deg`;
	document.getElementById('forecastTime18hr').innerHTML = `${new Date(forecastTime[5]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`;
}

function getClothingRecommendation(temp, monthDay, weather) {
	
	var shoes;
	var jacket = 'None';
	var bottoms = 'Jeans';
	var tops = 'T-shirt and shirt'; 
	var headwear = 'Cap';
	
	const month = Math.floor(monthDay / 100)
	
	if (temp < 5 || weather == 'Snow') {
		shoes = 'Winter boots';
		jacket = 'Camo winter jacket';
	} else {
		if ([12,1,2].includes(month)) {
			shoes = 'Red high-top sneakers';
		} else if ([3,4,5].includes(month)) {
			shoes = 'Blue shoes';
		} else if ([6,7,8].includes(month)) {
			shoes = 'Green high-top shoes';
		} else if ([9,10,11].includes(month)) {
			shoes = 'Grey sneakers';
		}
		
		if (temp < 18) {
			if (monthDay >= 806 && monthDay <= 1013) {
				jacket = 'Dark green jacket';
			} else if (monthDay >= 1014 && monthDay <= 1220) {
				jacket = 'Blue jacket';
			} else if (monthDay >= 1221 || monthDay <= 226) {
				jacket = 'Flannel jacket';
			} else if (monthDay >= 227 && monthDay <= 506) {
				jacket = 'Beige jacket';
			}
		} else if (temp < 21) {
			if (monthDay >= 321 && monthDay <= 920) {
				jacket = 'Green light jacket';
			} else if (monthDay >= 921 || monthDay <= 320) {
				jacket = 'Blue light jacket';
			}
		}
	}
	
	if (temp < 13) {
		headwear = 'Beanie';
	}
	
	if (temp < 10) {
		tops = 'Sweater, sweatshirt, and hoodie';
		bottoms = 'Jeans and heavy leggings';
	} else if (temp < 20) {
		tops = 'Sweatshirt and hoodie';
		bottoms = 'Jeans and light leggings';
	}
	
	return `<table>
			<tr><td><i>Headwear:</i>&emsp;</td><td>${headwear}</td></tr>
			<tr><td><i>Top:</i>&emsp;</td><td>${tops}</td></tr>
			<tr><td><i>Jacket:</i>&emsp;</td><td>${jacket}</td></tr>
			<tr><td><i>Bottoms:</i>&emsp;</td><td>${bottoms}</td></tr>
			<tr><td><i>Shoes:</i>&emsp;</td><td>${shoes}</td></tr>
			</table>`;
}

function showLoading() {
	document.getElementById('clothesText').innerHTML = '<div class="loading"><div></div><div></div><div></div><div></div></div>';
	}

function showError(message) {
	document.getElementById('clothesText').innerHTML = `<div class="error">${message}</div>`;
	document.getElementById('locationDiv').innerHTML = '';
	document.getElementById('dateDiv').innerHTML = '';
	document.getElementById('weatherTextDiv').innerHTML = '';
	document.getElementById('currentTemp').innerHTML = '';
	document.getElementById('weatherIcon').src = '';
	document.getElementById('weatherIcon').style.visibility = "hidden";
	document.getElementById('feelsLikeTempDiv').innerHTML = '';
	document.getElementById('minMaxTempDiv').innerHTML = '';
}
