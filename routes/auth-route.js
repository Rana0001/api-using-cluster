const {loginUser, registerUser} = require("../controller/user-controller");
const express = require("express");
const router = express.Router();


router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);

module.exports = router;