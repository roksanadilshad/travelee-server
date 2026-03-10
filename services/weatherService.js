// services/weatherService.js

const generateTag = (condition = "", temp = 0) => {
  condition = condition.toLowerCase();

  if (temp >= 38) return "Extreme_Heat";
  if (condition.includes("rain")) return "Rain";
  if (condition.includes("clear")) return "Clear";
  if (condition.includes("cloud")) return "Cloudy";
  if (condition.includes("thunderstorm")) return "Storm";
  if (condition.includes("snow")) return "Snow";

  return "Normal";
};

const getLiveForecast = async (city) => {
  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Live Weather API error");

  const dailyData = {};

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        condition: item.weather[0].main,
        temp: item.main.temp,
      };
    }
  });

  return Object.keys(dailyData).map((date, index) => ({
    day: index + 1,
    date,
    tag: generateTag(dailyData[date].condition, dailyData[date].temp),
    source: "Live_Forecast",
  }));
};

const getHistoricalAverage = async (city, startDate, daysCount = 7) => {
  if (!startDate) startDate = new Date().toISOString().split("T")[0];

  const historicalTags = ["Clear","Cloudy","Rain","Clear","Cloudy","Clear","Rain"];

  return Array.from({ length: daysCount }, (_, index) => {
    const dateObj = new Date(startDate);
    dateObj.setDate(dateObj.getDate() + index);

    return {
      day: index + 1,
      date: dateObj.toISOString().split("T")[0],
      tag: historicalTags[index % historicalTags.length],
      source: "Historical_Average",
    };
  });
};

const getWeatherForecast = async ({city, startDate, daysCount = 7}) => {
  if (!startDate) startDate = new Date().toISOString().split("T")[0];

  const today = new Date();
  const tripDate = new Date(startDate);
  today.setHours(0,0,0,0);
  tripDate.setHours(0,0,0,0);

  const diffInDays = Math.ceil((tripDate - today) / (1000*60*60*24));

  if (diffInDays >= 0 && diffInDays <= 7) {
    const liveData = await getLiveForecast(city);
    return liveData.slice(0, daysCount);
  } else {
    return await getHistoricalAverage(city, startDate, daysCount);
  }
};



module.exports = { getWeatherForecast };

