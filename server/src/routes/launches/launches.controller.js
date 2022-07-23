const { getAllLaunches, addNewLaunch } = require("../../models/launches.model");

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
    const launchId = req.params.id;


    return res.status(404).json({
        error: "launch not found"
    });


    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
};