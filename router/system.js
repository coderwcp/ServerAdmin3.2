const express = require("express");
const router = express.Router();

const { 
    getAuthList, 
    addAuthHandle, 
    editAuthHandle, 
    delAuthHandle, 
    getRoleList, 
    addRoleHandle, 
    editRoleHandle, 
    delRoleHandle, 
    getBgAdminList 
} = require('../router_handler/system')

// 校验方法
const { expressJoi } = require("../schema");
// 校验规则

// 权限
router.get('/system/auth', getAuthList)
router.post('/system/auth', addAuthHandle)
router.put('/system/auth', editAuthHandle)
router.delete('/system/auth', delAuthHandle)

// 角色
router.get('/system/role', getRoleList)
router.post('/system/role', addRoleHandle)
router.put('/system/role', editRoleHandle)
router.delete('/system/role', delRoleHandle)

// 后台管理员
router.get('/system/bgAdmin', getBgAdminList)

module.exports = router;
