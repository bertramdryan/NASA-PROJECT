const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const launches = new Map();


const DEFAULT_FLIGHT_NUMBER = 42398748;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);

function existsLaunchWithId(launchId) {
    return launches.has(launchId);
}

async function getLatestFlightNumber() {
    latestLuanch = await launchesDatabase
        .findOne({})
        .sort('-flightNumber');

    if (!latestLuanch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLuanch.flightNumber;
}

async function getAllLaunches() {
    return await launchesDatabase
        .find({}, {
            '_id': 0, '__v': 0
    });
}

async function saveLaunch(launch) {
    const planet = await planetsDatabase.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found');
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
        }, launch, {
            upsert: true
        });
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
    });

    await saveLaunch(newLaunch);
}


function abortLaunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    
    return aborted;
}


module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}