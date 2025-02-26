const API_KEY = '8a2706007ccb66f6b839422a95eac453';

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
		showResult(weatherData);
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
				showResult(weatherData);
			} catch (error) {
				showError('Failed to get weather');
			}
		},
		error => showError('Location access denied')
	);
}

function showResult(data) {
	
	const currentTemp = data.main.temp;
	const minTemp = data.main.temp_min;
	const maxTemp = data.main.temp_max;
	const feelsLikeTemp = data.main.feels_like;
	const weatherTextMain = data.weather[0].main;
	const weatherTextDesc = data.weather[0].description;
	const weatherIcon = data.weather[0].icon;
	const locationName = data.name;
	
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
	
	const clothes = getClothingRecommendation(feelsLikeTemp, monthDayNow, weatherTextMain);
	
	document.getElementById('locationDiv').innerHTML = `${locationName}`;
	document.getElementById('dateDiv').innerHTML = `${dayNameNow}, ${monthNameNow} ${dayNow}, ${yearNow}  &emsp;${hourAMPMNow}:${minuteNow} ${AMPM}`;
	document.getElementById('weatherTextDiv').innerHTML = `<p id="weatherTextMain">${weatherTextMain}</p><p id="weatherTextDesc">${weatherTextDesc}</p>`;
	document.getElementById('currentTemp').innerHTML = `<b>${currentTemp.toFixed(1)}</b>`;
	document.getElementById('weatherIcon').src = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
	document.getElementById('weatherIcon').style.visibility = "visible";
	document.getElementById('feelsLikeTempDiv').innerHTML = `Feels like ${feelsLikeTemp.toFixed(1)}&deg`;
	document.getElementById('minMaxTempDiv').innerHTML = `<b>High ${maxTemp.toFixed(1)}&deg&ensp;&middot&ensp;Low ${minTemp.toFixed(1)}&deg</b>`;
	document.getElementById('clothesText').innerHTML = `${clothes}`;
}

function getClothingRecommendation(temp, monthDay, weather) {
	
	var shoes;
	var jacket = 'None';
	var bottoms = 'Jeans';
	var tops = 'T-shirt'; 
	var headwear = 'Cap';
	
	const month = Math.floor(monthDay / 100)
	
	if (temp <= 4 || weather == 'Snow') {
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
		
		if (temp <= 16) {
			if (monthDay >= 821 && monthDay <= 1020) {
				jacket = 'Dark green jacket';
			} else if (monthDay >= 1021 && monthDay <= 1220) {
				jacket = 'Blue jacket';
			} else if (monthDay >= 1221 || monthDay <= 220) {
				jacket = 'Flannel jacket';
			} else if (monthDay >= 221 && monthDay <= 420) {
				jacket = 'Beige jacket';
			}
		} else if (temp <= 24) {
			if (monthDay >= 321 && monthDay <= 920) {
				jacket = 'Green light jacket';
			} else if (monthDay >= 921 || monthDay <= 320) {
				jacket = 'Blue light jacket';
			}
		}
	}
	
	if (temp <= 7) {
		tops = 'Sweater, sweatshirt, and hoodie';
		headwear = 'Beanie';
		bottoms = 'Jeans and heavy leggings';
	} else {
		if (temp <= 13) {
			bottoms = 'Jeans and light leggings';
		}
		
		if (temp <= 17) {
			tops = 'Sweatshirt and hoodie';
		}
	}
	
	return `<b>Headwear:</b>&emsp;${headwear}<br>
			<b>Top:</b>&emsp;${tops}<br>
			<b>Jacket:</b>&emsp;${jacket}<br>
			<b>Bottoms:</b>&emsp;${bottoms}<br>
			<b>Shoes:</b>&emsp;${shoes}`;
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

