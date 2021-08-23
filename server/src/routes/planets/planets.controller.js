const { getAllPlanets } = require('../../models/planets.model');

async function httpGetAllPlanets(request, response) {
  const allPlanets = await getAllPlanets();
  
  return response.status(200).json(allPlanets);
}

module.exports = { httpGetAllPlanets };