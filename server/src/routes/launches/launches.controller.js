const { existsLaunchWithId, getAllLaunches, addNewLaunch,  abortLaunchById} = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
    return res.status(200).json(getAllLaunches());
}

function httpPostNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate
        || !launch.target) {
            return res.status(400).json({
                error: 'Missing required launch property'
            });
        }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid Date'
        });
    }

    addNewLaunch(launch);
    res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
    const launchId =  Number(req.params.id);
    if (!existsLaunchWithId(launchId)) {
        return res.status(404).json({
            error: `Launch with LaunchId: ${launchId}, could not be found.`
        });
    }

    const aborted = abortLaunchById(launchId);

    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
};