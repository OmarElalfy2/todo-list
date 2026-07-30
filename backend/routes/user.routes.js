const express = require("express");
const { getApiStatus } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getApiStatus);

module.exports = router;