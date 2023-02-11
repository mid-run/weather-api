const axios = require("axios");

const geoip = require("geoip-lite");

const base = "https://api.open-meteo.com/v1/forecast";

const fs = require("fs");
const _ = require("lodash");
const csv = require("csv-parser");

//  Utils  🌦️
/////////////////////////////
async function readCSVFile(filePath) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.iata_code) {
          results[data.iata_code] = data;
        }
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
// Airport stuff
/////////////////////////////
let airports = [];
// CSV file with airport codes and lat-lon https://ourairports.com/data/
readCSVFile("./airports.csv").then((data) => {
  airports = data;
  console.log(airports["SYD"]);
});

getByAirport = async (code, opt) => {
  if (!opt) opt = {};
  const airport = airports[code];
  console.log(airport);
  opt.airport = airport;
  return getByGeo(airport.latitude_deg, airport.longitude_deg, opt);
};

//   IP stuff
/////////////////////////////
async function getByIp(ip, opt) {
  if (!opt) opt = {};
  const geo = await getGeoByIp(ip);
  opt.geo = geo;
  return getByGeo(geo.ll[0], geo.ll[1], opt);
}

async function getGeoByIp(ip) {
  console.log(ip);
  const geo = geoip.lookup(ip);
  console.log("GET ip: ", ip, geo);
  return geo;
}

//  Call the OpenMeteo API
/////////////////////////////
async function getByGeo(lat, lon, opt) {
  console.log("GET geo: ", lat, lon);
  //customize here.: https://open-meteo.com/en/docs
  var query =
    "&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,showers,snowfall&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours&current_weather=true&timezone=GMT";
  /*
  query = "hourly=temperature_2m";
  query += "&daily=temperature_2m";
  query += "&current_weather=true";*/
  var { data } = await axios.get(
    `${base}?latitude=${lat}&longitude=${lon}&${query}`
  );
  //example: https://api.open-meteo.com/v1/forecast?latitude=45.51&longitude=-73.59&hourly=temperature_2m
  // cleanup the data
  data = _.omit(data, ["generationtime_ms"]);

  if (opt.geo) {
    // append the country + city name
    data.geo = opt.geo;
  }
  if (opt.airport) {
    // append airport metadata
    data.airport = opt.airport;
  }
  return data;
}

module.exports = {
  home: async () => {
    return "⚡ Your custom Weather API is working on Midrun ⚡";
  },
  geo: async ({ lat, lon, opt }) => {
    return getByGeo(lat, lon, opt);
  },
  auto: async ({ userIp, opt }) => {
    return await getByIp(userIp, opt);
  },
  auto: async ({ ip, opt }) => {
    return await getByIp(ip, opt);
  },
  airport: async ({ code, opt }) => {
    code = String(code).toUpperCase();
    return await getByAirport(code, opt);
  },
};
