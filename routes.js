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
  // console.log(airports["SYD"]);
});

getByAirport = async (code, opt) => {
  if (!opt) opt = {};
  const airport = airports[code];
  if (!airport) throw new Error("Can't find airport: " + code);
  console.log(airport);
  opt.airport = airport;
  return getByGeo(airport.latitude_deg, airport.longitude_deg, opt);
};

//   IP stuff
/////////////////////////////
async function getByIp(ip, opt) {
  if (!opt) opt = {};
  const geo = await getGeoByIp(ip);
  if (!geo) throw new Error("Can't find geo for ip: " + ip);
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

  if (opt.geo) data.geo = opt.geo; // append the country + city name
  if (opt.airport) data.airport = opt.airport; // append airport metadata
  if (opt.ip) data.ip = opt.ip;
  return data;
}

module.exports = {
  status: async () => {
    return {
      about: "⚡ Weather API example working on Midrun ⚡",
      status: "up!",
    };
  },
  geo: async ({ lat, lon, opt }) => {
    return getByGeo(lat, lon, opt);
  },
  auto: async ({ userIp, opt }) => {
    opt.ip = userIp;
    return await getByIp(userIp, opt);
  },
  ip: async ({ ip, opt }) => {
    opt.ip = ip;
    return await getByIp(ip, opt);
  },

  airport: async ({ code, opt }) => {
    code = String(code).toUpperCase();
    return await getByAirport(code, opt);
  },
};
