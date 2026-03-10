// // services/activitySwapService.js

// const activityCategories = {
//   "Beach Walk": "Outdoor",
//   "Hiking": "Outdoor",
//   "City Tour": "Outdoor",
//   "Boat Ride": "Outdoor",
//   "Safari Trip": "Outdoor",

//   "Museum Visit": "Indoor",
//   "Art Gallery": "Indoor",
//   "Local Cafe": "Indoor",
//   "Shopping Mall": "Indoor",
//   "Cultural Show": "Indoor",
// };

// const indoorSuggestions = [
//   "Museum Visit",
//   "Art Gallery",
//   "Local Cafe",
//   "Shopping Mall",
//   "Cultural Show",
// ];

// const normalize = (text = "") => text.trim().toLowerCase();

// // const getActivitySuggestion = (weatherTag, currentActivity = "") => {
// //   const normalizedActivity = normalize(currentActivity);

// //   const matchedKey = Object.keys(activityCategories).find(
// //     (key) => normalize(key) === normalizedActivity
// //   );

// //   const category = matchedKey ? activityCategories[matchedKey] : "Outdoor";

// //   const badWeatherConditions = ["Rain","Cloudy", "Extreme_Heat", "Storm", "Snow"];

// //   if (badWeatherConditions.includes(weatherTag) && category === "Outdoor") {
// //     const randomIndoor =
// //       indoorSuggestions[Math.floor(Math.random() * indoorSuggestions.length)];

// //     return {
// //       swapRecommended: true,
// //       originalActivity: currentActivity || "Outdoor Activity",
// //       suggestedActivity: randomIndoor,
// //       reason: `Weather is ${weatherTag}. Indoor activity recommended.`,
// //     };
// //   }

// //   return {
// //     swapRecommended: false,
// //     originalActivity: currentActivity || "Activity",
// //     suggestedActivity: currentActivity || "Activity",
// //     reason: "Weather conditions are suitable for this activity.",
// //   };
// // };

// const getActivitySuggestion = (weatherTag, currentActivity = "") => {
//   const normalizedActivity = normalize(currentActivity);
//   const matchedKey = Object.keys(activityCategories).find(
//     (key) => normalize(key) === normalizedActivity
//   );
//   const category = matchedKey ? activityCategories[matchedKey] : "Outdoor";
//   const badWeatherConditions = ["Rain","Cloudy", "Extreme_Heat", "Storm", "Snow"];

//   if (badWeatherConditions.includes(weatherTag) && category === "Outdoor") {
//     const shuffledIndoor = indoorSuggestions.sort(() => 0.5 - Math.random());
//     const suggested = shuffledIndoor[0]; // take first from shuffled

//     return {
//       swapRecommended: true,
//       originalActivity: currentActivity || "Outdoor Activity",
//       suggestedActivity: suggested,
//       reason: `Weather is ${weatherTag}. Indoor activity recommended.`,
//     };
//   }

//   return {
//     swapRecommended: false,
//     originalActivity: currentActivity || "Activity",
//     suggestedActivity: currentActivity || "Activity",
//     reason: "Weather conditions are suitable for this activity.",
//   };
// };

// module.exports = { getActivitySuggestion };



const activityCategories = {
  "Beach Walk": "Outdoor",
  "Hiking": "Outdoor",
  "City Tour": "Outdoor",
  "Boat Ride": "Outdoor",
  "Safari Trip": "Outdoor",
  "Museum Visit": "Indoor",
  "Art Gallery": "Indoor",
  "Local Cafe": "Indoor",
  "Shopping Mall": "Indoor",
  "Cultural Show": "Indoor"
};

const indoorSuggestions = ["Museum Visit","Art Gallery","Local Cafe","Shopping Mall","Cultural Show"];

const normalize = text => text.trim().toLowerCase();

const getActivitySuggestion = (weatherTag, currentActivity = "") => {
  const normalizedActivity = normalize(currentActivity);
  const matchedKey = Object.keys(activityCategories).find(key => normalize(key) === normalizedActivity);
  const category = matchedKey ? activityCategories[matchedKey] : "Outdoor";

  const badWeatherConditions = ["Rain","Storm","Snow","Extreme_Heat"]; // Cloudy removed

  if (badWeatherConditions.includes(weatherTag) && category === "Outdoor") {
    const shuffled = [...indoorSuggestions].sort(() => 0.5 - Math.random());
    return {
      swapRecommended: true,
      originalActivity: currentActivity || "Outdoor Activity",
      suggestedActivity: shuffled[0],
      reason: `Weather is ${weatherTag}. Indoor activity recommended.`
    };
  }

  return {
    swapRecommended: false,
    originalActivity: currentActivity || "Activity",
    suggestedActivity: currentActivity || "Activity",
    reason: "Weather conditions are suitable."
  };
};

module.exports = { getActivitySuggestion };