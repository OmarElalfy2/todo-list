const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
    getApiStatus,
    registerUser,
    loginUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getApiStatus);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/protected", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You have access to protected route",
        user: req.user,
    });
});


module.exports = router;