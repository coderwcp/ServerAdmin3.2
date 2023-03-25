const db = require("../db");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

module.exports = {
	login(req, res) {
		// 获取用户登录的信息
		const { username, password } = req.body;
		// 检查数据库是否有该用户
		const sqlStr = "SELECT * FROM user_list WHERE username = ?";
		db.query(sqlStr, username, (err, result) => {
			// 解决异常
			if (err) throw err;
			// 用户名不存在
			if (result.length === 0) return res.cc("用户名不存在");
			// 校验密码
			const flag = password === result[0].password;
			if (!flag) return res.cc("用户名或密码错误");
			// 验证通过 返回token
			const token = jwt.sign({ ...result[0], password: "" }, secretKey, {
				expiresIn: "2h",
			});
			const user_info = result[0]
			user_info.roleId = user_info.role_id
			delete user_info.role_id
			// 返回登陆成功
			res.send({
				code: 200,
				msg: "登陆成功",
				data: {
					access_token: "Bearer " + token,
					user_info
				},
			});
		});
	},
	register(req, res) {},
};
