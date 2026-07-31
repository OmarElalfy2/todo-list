const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
    registerUser,
    loginUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/protected", authMiddleware, (req, res) => {
    return res.json({
        success: true,
        message: "You have access to protected route",
        user: req.user,
    });
});

module.exports = router;