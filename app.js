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
const hourAMPMNow = (hourNow == 0 || hourNow == 12) ? 12 : hourNow % 12;
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
				const weatherResponse = await fetch(
					`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${API_KEY}`
				);
				const weatherData = await weatherResponse.json();
				
				const forecastResponse = await fetch(
					`https://api.openweathermap.org/data/2.5/forecast?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&cnt=8&appid=${API_KEY}`
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
	
	debugger;
	
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
	var clothesTemp = feelsLikeTemp;
	
	for (let i = 0; i < 8; i++) {
		forecastTemp.push(forecast.list[i].main.temp);
		forecastIcon.push(forecast.list[i].weather[0].icon);
		forecastFeelsLike.push(forecast.list[i].main.feels_like);
		forecastTime.push(forecast.list[i].dt_txt);
	}
	
	var forecastContent = [
		[
			`${currentTemp.toFixed(1)}&deg`, 
			`<img src="https://openweathermap.org/img/wn/${weatherIcon}.png"></img>`,
			`Feels like ${feelsLikeTemp.toFixed(1)}&deg`,
			'Now'
		]
	];
	for (let j = 0; j < 8; j++) {
		if (new Date(forecastTime[j]).getHours() > hourNow) {
			forecastContent.push([
				`${forecastTemp[j].toFixed(1)}&deg`,
				`<img src="https://openweathermap.org/img/wn/${forecastIcon[j]}.png"></img>`,
				`Feels like ${forecastFeelsLike[j].toFixed(1)}&deg`,
				`${new Date(forecastTime[j]).toLocaleString('en-US', { hour: 'numeric', hour12: true})}`
			]);
			clothesTemp = clothesTemp + forecastFeelsLike[j];
		}
		
	}
	
	var forecastCount = forecastContent.length;
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
	
	
	createForecastGrid(forecastContent);
}

function getClothingRecommendation(temp, monthDay, weather) {
	
	var shoes;
	var jacket = 'No jacket';
	var bottoms = 'Pants';
	var tops = 'T-shirt'; 
	var headwear = 'Cap';
	
	if (temp < 4 || weather == 'Snow') {
		shoes = 'Winter boots';
		jacket = 'Camo winter jacket';
		bottoms = 'Pants with heavy leggings';
		tops = 'Sweater';
		headwear = 'Beanie';
	} else {
		if (monthDay >= 1109 || monthDay <= 120) {
			shoes = 'Black and white shoes';
		} else if (monthDay >= 121 && monthDay <= 403) {
			shoes = 'Red shoes';
		} else if (monthDay >= 404 && monthDay <= 615) {
			shoes = 'Green shoes';
		} else if (monthDay >= 616 && monthDay <= 827) {
			shoes = 'Blue shoes';
		} else if (monthDay >= 828 && monthDay <= 1108) {
			shoes = 'Grey shoes';
		}
		
		if (temp < 4.48) {
			jacket = 'Heavy jacket';
			bottoms = 'Pants with heavy leggings';
			tops = 'Hoodie';
		} else if (temp < 6.24) {
			jacket = 'Heavy jacket';
			bottoms = 'Pants with light leggings';
			tops = 'Sweater';
		} else if (temp < 6.72) {
			jacket = 'Heavy jacket';
			bottoms = 'Pants with light leggings';
			tops = 'Hoodie';
		} else if (temp < 7.51) {
			jacket = 'Heavy jacket';
			bottoms = 'Pants with heavy leggings';
			tops = 'Sweatshirt';
		} else if (temp < 9.75) {
			jacket = 'Heavy jacket';
			bottoms = 'Pants with light leggings';
			tops = 'Sweatshirt';
		} else if (temp < 10.52) {
			bottoms = 'Pants with heavy leggings';
			tops = 'Sweater';
		} else if (temp < 11.00) {
			bottoms = 'Pants with heavy leggings';
			tops = 'Hoodie';
		} else if (temp < 12.76) {
			bottoms = 'Pants with light leggings';
			tops = 'Sweater';
		} else if (temp < 13.12) {
			jacket = 'Heavy jacket';
			tops = 'Sweatshirt';
		} else if (temp < 13.24) {
			bottoms = 'Pants with light leggings';
			tops = 'Hoodie';
		} else if (temp < 14.03) {
			bottoms = 'Pants with heavy leggings';
			tops = 'Sweatshirt';
		} else if (temp < 16.27) {
			bottoms = 'Pants with light leggings';
			tops = 'Sweatshirt';
		} else if (temp < 16.63) {
			jacket = 'Light jacket';
			bottoms = 'Pants with light leggings';
		} else if (temp < 20) {
			jacket = 'Light jacket';
		}
		
		if (jacket == 'Heavy jacket') {
			if (monthDay >= 622 && monthDay <= 1013) {
				jacket = 'Dark green jacket';
			} else if (monthDay >= 1014 && monthDay <= 1220) {
				jacket = 'Blue jacket';
			} else if (monthDay >= 1221 || monthDay <= 226) {
				jacket = 'Flannel jacket';
			} else if (monthDay >= 227 && monthDay <= 621) {
				jacket = 'Beige jacket';
			}
		} else if (jacket == 'Light jacket') {
			if (monthDay >= 321 && monthDay <= 920) {
				jacket = 'Green light jacket';
			} else if (monthDay >= 921 || monthDay <= 320) {
				jacket = 'Blue light jacket';
			}
		}
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
