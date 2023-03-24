const express = require("express");
const router = express.Router();

const { login, register } = require("../router_handler/user");

// 校验方法
const { expressJoi } = require("../schema");
// 校验规则
const { login_reg_schema } = require("../schema/user");

router.post("/login", expressJoi(login_reg_schema), login);
router.post("/register", expressJoi(login_reg_schema), register);

module.exports = router;
