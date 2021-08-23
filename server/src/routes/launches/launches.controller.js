const {
  abortLaunchByFlightNumber,
  getExistingLaunchWithFlightNumber,
  getAllLaunches,
  scheduleNewLaunch
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(request, response) {
  const { limit, skip } = getPagination(request.query);

  const allLaunches = await getAllLaunches(limit, skip);

  return response.status(200).json(allLaunches);
}

async function httpAddNewLaunch(request, response) {
  const {
    launchDate,
    mission,
    rocket,
    target
  } = request.body;

  if (!mission || !rocket || !target || !launchDate) {
    return response.status(400).json({
      error: 'Missing required field'
    });
  }

  const date = new Date(launchDate);

  if (isNaN(date)) {
    return response.status(400).json({
      error: 'Invalid launch date'
    });
  }

  const launch = {
    launchDate: date,
    mission,
    rocket,
    target
  };


  await scheduleNewLaunch(launch);

  return response.status(201).json(launch);
}

async function httpAbortLaunch(request, response) {
  const flightNumberToAbort = Number(request.params.id);

  const existingLaunch = await getExistingLaunchWithFlightNumber(flightNumberToAbort);

  if (!existingLaunch) {
    return response.status(404).json({
      error: 'Launch not found'
    })
  }

  const isAbortedSuccessfully = await abortLaunchByFlightNumber(flightNumberToAbort);

  if (!isAbortedSuccessfully) {
    return response.status(400).json({
      error: 'Launch not aborted'
    })
  }

  return response.status(200).json({ ok: true });
}

module.exports = {
  httpAbortLaunch,
  httpAddNewLaunch,
  httpGetAllLaunches
};