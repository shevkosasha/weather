const WeatherWidget = (function(){
  
  let weatherDiv = null;
  let loaderSvg, loading;
  let crd;

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  const api = {
    url: "https://api.openweathermap.org/data/2.5/",
    key: "72f441e22e812a52dc0a67a6754263ce",
  }

  const field = {
    render: () => {
      return `
        <button id="hideWeather">Hide weather</button>
        <button id="showForecast">3 дня</button>        
        <h1>Погода</h1>
        <object id="svgIcon" type="image/svg+xml" data="sun.svg" width="40" height="40" >
        Your browser does not support SVG
        </object>
        <p id = 'loading'>Loading location...</p>
        <h2 id="location"></h2>
        <h3 id="temp-icon"></h3>
        <div id="temp"></div>
        <div id="description"></div>
        <div id="image"></div>
        <div id="wind"></div>
        <div id = 'threeDays'>        
          <object id="svgIcon2" type="image/svg+xml" data="loader.svg" width="30" height="30" >
          Your browser does not support SVG
          </object>
          <div id = 'firstDay'></div>
          <div id = 'secondDay'></div>
          <div id = 'thirdDay'></div>
          <button id="closeForecast">Свернуть</button>
        </div>
      `;
    }
  }

  function createField(){
    weatherDiv = document.createElement('div');
    weatherDiv.id = 'weather';
    showWeatherBtn = document.createElement('button');
    showWeatherBtn.id = 'showWeather';
    showWeatherBtn.innerText = 'Show weather';
    showWeatherBtn.style.display = 'none';
    weatherDiv.innerHTML = field.render();
    document.body.append(showWeatherBtn);
    document.body.append(weatherDiv);
}

  function error(err){
    console.warn(`ERROR(${err.code}): ${err.message}`);
    if (err.code === 1) {
      loading.innerText = 'Геопозиция выключена. Для того, чтобы отобразить погоду, нужно ее включить';      
    }
    else if (err.code === 3) {
        loading.innerText = 'Что-то пошло не так! Перезагрузите страничку';
    }
  }

  function getWeatherData(pos){//get today weather

    crd = pos.coords;
    const apiQuery = api.url+"weather?lat="+crd.latitude+"&lon="+crd.longitude+"&units=metric&lang=ru&appid="+api.key;

    fetch(apiQuery)
    .then(response => response.json())
    .then(data => {
      printWeather(data);
      addListeners();
    })         
    .catch(error => console.error('Причина: '+ error));

  }

  function getForecast(){ //get 3 day weather
    // let crd = pos.coords;
    loaderSvg2 = document.getElementById('svgIcon2');
    const threeDaysQuery = api.url+"forecast?lat="+crd.latitude+"&lon="+crd.longitude+"&cnt=3&units=metric&lang=ru&appid="+api.key;

    fetch(threeDaysQuery)// получение погоды на три дня
    .then(response => response.json())
    .then(data => printForecastData(data))
    .catch(error => console.error('Причина: '+ error)); 
  }

  function printWeather(data){
    loaderSvg = document.getElementById('svgIcon');
    loading = document.getElementById('loading');
    
    loaderSvg.style.display = 'none';
    loading.style.display = 'none';
    
    document.getElementById('location').innerHTML = (`${data.name} ${data.sys.country}`);
    document.getElementById('temp-icon').innerHTML = (`${data.main.temp} &#176;C <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png"/>`);
    document.getElementById('temp').innerHTML = `Температура: <strong>${data.main.temp} &#176;C</strong>,
                ощущается как <strong>${data.main.feels_like} &#176;C</strong>.`;
    document.getElementById('description').innerHTML = `В целом на улице: <strong>${data.weather[0].description} </strong>, 
                влажность: <strong>${data.main.humidity}%</strong>.`;
    document.getElementById('wind').innerHTML = `Скорость ветра: <strong>${data.wind.speed} м/с</strong>.`;
  }

  function printForecastData(data){ 
      
      let firstDay = document.getElementById('firstDay');
      let secondDay = document.getElementById('secondDay');
      let thirdDay = document.getElementById('thirdDay');

      const date = new Date();
      let nextMonthFirstDate = new Date (date.getFullYear(), (date.getMonth()+1),1); //get first day of next month
      let curMonthLastDate = new Date (date.getFullYear(), (date.getMonth()+1),0); //get last day of current month
     
      const getDate = (days) =>  {
        let day, month;
        if (date.getDate()+days <= curMonthLastDate.getDate()) {
          day = date.getDate()+days;
          month = date.getMonth()+1;
        } else {
          day = nextMonthFirstDate.getDate();
          month = nextMonthFirstDate.getMonth()+1;
        } 
        return {day: day, month: month}; 
      }   
      
      loaderSvg2.style.display = 'none';
     
      firstDay.innerHTML = `<strong>${getDate(1).day}/${getDate(1).month}</strong><p>Температура: 
                            <strong>${data.list[0].main.temp}&#176;C</strong> </p>
                            <p>На улице: ${data.list[0].weather[0].description}, влажность: ${data.list[0].main.humidity}%</p>`;
      secondDay.innerHTML = `<strong>${getDate(2).day}/${getDate(2).month}</strong><p>Температура:
                            <strong>${data.list[1].main.temp}&#176;C</strong> </p>
                            <p>На улице: ${data.list[1].weather[0].description}, влажность: ${data.list[0].main.humidity}%</p>`;
      thirdDay.innerHTML = `<strong>${getDate(3).day}/${getDate(3).month}</strong><p>Температура:
                            <strong>${data.list[2].main.temp}&#176;C </strong></p>
                            <p>На улице: ${data.list[2].weather[0].description}, влажность: ${data.list[0].main.humidity}%</p>`;
  };

  function addListeners() {

    weatherDiv = document.getElementById('weather');
    let hideBtn = document.getElementById('hideWeather');
    let showBtn = document.getElementById('showWeather');
    let forecastBtn = document.getElementById('showForecast');
    let closeForecastBtn = document.getElementById('closeForecast');
    let threeDaysDiv = document.getElementById('threeDays');

    hideBtn.addEventListener('click',(e) =>{
      e.preventDefault();
      weatherDiv.style.display = 'none';
      showBtn.style.display = 'block';
      hideBtn.style.display = 'none';
    });
    showBtn.addEventListener('click',(e) => {
      e.preventDefault();
      weatherDiv.style.display = 'block';
      showBtn.style.display = 'none';
      hideBtn.style.display = 'block';
    });
    forecastBtn.addEventListener('click',function(e){
      e.preventDefault();
      navigator.geolocation.getCurrentPosition(getForecast, error, options);
      threeDaysDiv.style.display = 'block';
      forecastBtn.style.display = 'none';
    });
    closeForecastBtn.addEventListener('click',function(e){
      e.preventDefault();
      threeDaysDiv.style.display = 'none';
      forecastBtn.style.display = 'block';
    });
  };


  return {
    getWeather: function() {
      createField();
      navigator.geolocation.getCurrentPosition(getWeatherData, error, options);
    }
  }
}());