const { Router } = require('express');

const {
  httpAbortLaunch,
  httpAddNewLaunch,
  httpGetAllLaunches
} = require('./launches.controller');

const launchesRouter = Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;