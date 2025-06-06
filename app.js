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
			`https://api.openweathermap.org/data/2.5/forecast?lat=${locationLat}&lon=${locationLon}&units=metric&cnt=8&appid=${API_KEY}`
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
	var forecastCount = Math.floor((24 - hourNow) / 3) > 0 ? Math.floor((24 - hourNow) / 3) : 1;
	
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
	
	var forecastContent = [
		[
			`${currentTemp.toFixed(1)}&deg`, 
			`<img src="https://openweathermap.org/img/wn/${weatherIcon}.png"></img>`,
			`Feels like ${feelsLikeTemp.toFixed(1)}&deg`,
			'Now'
		]
	];
	for (let j = 0; j < forecastCount; j++) {
		forecastContent.push([
			`${forecastTemp[j].toFixed(1)}&deg`,
			`<img src="https://openweathermap.org/img/wn/${forecastIcon[j]}.png"></img>`,
			`Feels like ${forecastFeelsLike[j].toFixed(1)}&deg`,
			`${new Date(forecastTime[j]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`
		]);
	}
	
	createForecastGrid(forecastContent);
}

function getClothingRecommendation(temp, monthDay, weather) {
	
	var shoes;
	var jacket = 'No jacket';
	var bottoms = 'Jeans';
	var tops = 'T-shirt and shirt'; 
	var headwear = 'Cap';
	
	const month = Math.floor(monthDay / 100)
	
	if (temp < 5 || weather == 'Snow') {
		shoes = 'Winter boots';
		jacket = 'Camo winter jacket';
	} else {
		if ([11,12,1].includes(month)) {
			shoes = 'Red high-top sneakers';
		} else if ([2,3,4].includes(month)) {
			shoes = 'Blue shoes';
		} else if ([5,6,7].includes(month)) {
			shoes = 'Green high-top shoes';
		} else if ([8,9,10].includes(month)) {
			shoes = 'Grey sneakers';
		}
		
		if (temp < 16) {
			if (monthDay >= 622 && monthDay <= 1013) {
				jacket = 'Dark green jacket';
			} else if (monthDay >= 1014 && monthDay <= 1220) {
				jacket = 'Blue jacket';
			} else if (monthDay >= 1221 || monthDay <= 226) {
				jacket = 'Flannel jacket';
			} else if (monthDay >= 227 && monthDay <= 621) {
				jacket = 'Beige jacket';
			}
		} else if (temp < 20) {
			if (monthDay >= 321 && monthDay <= 920) {
				jacket = 'Green light jacket';
			} else if (monthDay >= 921 || monthDay <= 320) {
				jacket = 'Blue light jacket';
			}
		}
	}
	
	if (temp < 9) {
		headwear = 'Beanie';
	}
	
	if (temp < 13) {
		tops = 'Sweater, sweatshirt, and hoodie';
		bottoms = 'Jeans and heavy leggings';
	} else if (temp < 18) {
		tops = 'Sweatshirt and hoodie';
		bottoms = 'Jeans and light leggings';
	}
	
	return `<table>
			<tr><td class="tdBottom">${headwear}</td></tr>
			<tr><td class="tdBottom">${jacket}</td></tr>
			<tr><td class="tdBottom">${tops}</td></tr>
			<tr><td class="tdBottom">${bottoms}</td></tr>
			<tr><td>${shoes}</td></tr>
			</table>`;
}

function createForecastGrid(contentArray) {
	const forecastContainer = document.getElementById('forecastGridsDiv');
	forecastContainer.innerHTML = '';
	
	contentArray.forEach((columnItems) => {
		const column = document.createElement('div');
		column.className = 'forecastGrid';
		
		columnItems.forEach(itemHTML => {
			const item = document.createElement('div');
			item.innerHTML = itemHTML;
			column.appendChild(item);
		});
		
		forecastContainer.appendChild(column);
	});
}

function showLoading() {
	document.getElementById('clothesText').innerHTML = '<div class="loading"><div></div><div></div><div></div><div></div></div>';
	}

function showError(message) {
	document.getElementById('clothesText').innerHTML = `<div class="error">${message}</div>`;
	document.getElementById('currentWeatherDiv').style.visibility = "hidden";
	document.getElementById('forecastDiv').style.visibility = "hidden";
	document.getElementById('currentWeatherIcon').style.visibility = "hidden";
}
