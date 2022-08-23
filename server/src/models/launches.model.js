const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const launches = new Map();


const DEFAULT_FLIGHT_NUMBER = 42398748;


const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    console.log("Downloading launch data...");
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }

        // console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }


}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstLaunch) {
        console.log('Launch data was already loaded');
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
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

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find({}, {
            '_id': 0, '__v': 0
        })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {


    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planetsDatabase.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found');
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
    });

    await saveLaunch(newLaunch);
}


async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    }
    );

    return aborted.modifiedCount === 1;
}


module.exports = {
    loadLaunchesData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}