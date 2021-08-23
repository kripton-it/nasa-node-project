const axios = require('axios');

const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const defaultFlightNumber = 100;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function getLatestFlightNumber() {
  const latestLaunch = await launches
    .findOne()
    .sort('-flightNumber');

  if (!latestLaunch) return defaultFlightNumber;

  return latestLaunch.flightNumber;
}

async function getAllLaunches(limit, skip) {
  // Ищем все запуски
  const filter = {};
  // Исключаем ненужные поля
  const projection = {
    '_id': 0,
    '__v': 0
  };

  return await launches
    .find(filter, projection)
    .sort('flightNumber')
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await getPlanet(launch.target);

  if (!planet) {
    throw new Error('No matching planet found!');
  }

  const latestFlightNumber = await getLatestFlightNumber();

  const newLaunch = Object.assign(
    launch,
    {
      flightNumber: latestFlightNumber + 1,
      customers: ['ZTM', 'NASA'],
      upcoming: true,
      success: true
    }
  );

  await saveLaunch(newLaunch);
}

async function getExistingLaunchWithFlightNumber(flightNumber) {
  const filter = { flightNumber };

  return await findLaunch(filter);
}

async function abortLaunchByFlightNumber(flightNumber) {
  const filter = { flightNumber };
  const update = {
    upcoming: false,
    success: false
  };

  const response = await launches.updateOne(filter, update);

  return response.ok === 1 && response.nModified === 1;
}

async function saveLaunch(launch) {
  const filter = {
    flightNumber: launch.flightNumber
  };

  await launches.findOneAndUpdate(filter, launch, { upsert: true });
}

async function getPlanet(planetName) {
  const filter = {
    keplerName: planetName
  };

  return await planets.findOne(filter);
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function populateLaunches() {
  console.log('Downloading launch data...');

  const data = {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  };

  const response = await axios.post(SPACEX_API_URL, data);

  if (response.status !== 200) {
    console.log('Problem with downloading launch data');
    throw new Error('Launch data download failed!');
  }

  for (const launchDoc of response.data.docs) {
    const payloads = launchDoc['payloads'];

    const customers = payloads.flatMap(payload => payload['customers']);

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      // remove duplicates
      customers: Array.from(new Set(customers)),
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success']
    };

    console.log(launch.flightNumber);
    console.log(launch.customers);

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const filter = {
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  };
  const firstLaunch = await findLaunch(filter);

  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }
}

module.exports = {
  abortLaunchByFlightNumber,
  getExistingLaunchWithFlightNumber,
  getAllLaunches,
  scheduleNewLaunch,
  loadLaunchData
};