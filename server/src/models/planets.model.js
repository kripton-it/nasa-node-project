const { createReadStream } = require('fs');
const { join } = require('path');

const parse = require('csv-parse');

const planets = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36
    && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    const filePath = join(__dirname, '..', '..', 'data', 'kepler_data.csv');

    createReadStream(filePath)
      .pipe(parse({
        comment: '#',
        columns: true
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .on('end', async () => {
        const planets = await getAllPlanets();
        console.log(`${planets.length} habitable planets found!`);
        resolve();
      });
  })
}

async function getAllPlanets() {
  // Ищем все планеты
  const filter = {};
  // Исключаем ненужные поля
  const projection = {
    '_id': 0,
    '__v': 0
  };
  return await planets.find(filter, projection);
}

// Сохранение планеты в БД
async function savePlanet(data) {
  const planet = { keplerName: data.kepler_name };
  const filter = planet;
  const update = planet;
  try {
    // upsert = true - если не найден объект по критерию filter, создаётся новый объект равный update
    // upsert = false - если не найден объект по критерию filter, ничего не происходит
    // если найден объект по критерию filter, заменяется на объект равный update
    await planets.updateOne(filter, update, { upsert: true });
  } catch(err) {
    console.error('Could not save the planet:');
    console.error(data);
    console.error(`Error: ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets
};