const generateTag = (condition = "", temp = 0) => {
  condition = condition.toLowerCase();

  if (temp >= 38) return "Extreme_Heat";
  if (condition.includes("rain")) return "Rain";
  if (condition.includes("clear")) return "Clear";
  if (condition.includes("cloud")) return "Cloudy";
  if (condition.includes("storm")) return "Storm";
  if (condition.includes("snow")) return "Snow";

  return "Normal";
};

const getLiveForecast = async (city, daysCount = 5) => {
  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Weather API Error");

  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = { condition: item.weather[0].main, temp: item.main.temp };
  });

  return Object.keys(daily)
    .slice(0, daysCount)
    .map((date, index) => ({
      day: index + 1,
      date,
      tag: generateTag(daily[date].condition, daily[date].temp),
      source: "Live_Forecast"
    }));
};

const getHistoricalAverage = (startDate, daysCount = 5) => {
  const tags = ["Clear", "Cloudy", "Rain", "Clear", "Cloudy"];
  return Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      day: i + 1,
      date: d.toISOString().split("T")[0],
      tag: tags[i % tags.length],
      source: "Historical_Average"
    };
  });
};

const getWeatherForecastPay = async (city, startDate, daysCount = 5) => {
  const today = new Date();
  const tripDate = new Date(startDate);
  today.setHours(0,0,0,0);
  tripDate.setHours(0,0,0,0);

  const diffDays = Math.ceil((tripDate - today) / (1000*60*60*24));

  if (diffDays <= 7) return await getLiveForecast(city, daysCount);
  return getHistoricalAverage(startDate, daysCount);
};

module.exports = { getWeatherForecastPay };