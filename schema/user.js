const Joi = require('@hapi/joi')

/*** 
 * string() 值必须是字符串 
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串 * 
 * min(length) 最小长度 * max(length) 最大长度 * 
 * required() 值是必填项，不能为 undefined * 
 * pattern(正则表达式) 值必须符合正则表达式的规则 
 * */
const username = Joi.string().alphanum().min(4).max(12).required()
const password = Joi.string().pattern(/^[\S]{6,12}/).required()
const id = Joi.number().integer().min(1).required()
const nickname = Joi.string().required()
const email = Joi.string().email().required()
const avatar = Joi.string().dataUri().required()

module.exports = {
    // 登录注册用户验证
    login_reg_schema: {
        body: {
            username,
            password,
        }
    },
    // 更新用户邮箱和昵称
    update_user_schema: {
        body: {
            id,
            nickname,
            email,
        }
    },
    // 修改密码验证
    update_pwd_schema: {
        body: {
            oldPwd: password,
            // 1. joi.ref('oldPwd') 表示 newPwd 的值必须和 oldPwd 的值保持一致
            // 2. joi.not(joi.ref('oldPwd')) 表示 newPwd 的值不能等于 oldPwd 的值
            // 3. .concat() 用于合并 joi.not(joi.ref('oldPwd')) 和 password 这两条验证规则
            newPwd: Joi.not(Joi.ref('oldPwd')).concat(password)
        }
    },
    // 更新头像
    update_avatar_schema: {
        body: {
            avatar
        }
    }
}