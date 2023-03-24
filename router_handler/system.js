const db = require('../db')
const { queryAsync } = require('../db/queryAsync')
const { tranListToTreeData } = require('../utils')
const moment = require('moment')

module.exports = {
    // 权限列表
    async getAuthList(req, res) {
        try {
            // 权限的id数组
            let sqlStr = `SELECT * FROM menu_list a LEFT JOIN menu_meta_list b ON a.id = b.main_id WHERE a.status=1`
            if(req.query.roleId != 0) {
                const [{auth_ids}] = await queryAsync(`SELECT auth_ids FROM role_list WHERE id=${Number(req.query.roleId)}`)
                sqlStr+= ` AND a.id IN (${auth_ids})`
            }
            const result = await queryAsync(sqlStr) 
            let data = [];
			result.forEach(row => {
				const temp = {};
				temp.id = row.id;
				temp.parentId = row.parent_id;
				temp.name = row.name;
				temp.path = row.path;
				row.component && (temp.component = row.component);
				temp.isMenu = row.is_menu === 1 ? true: false;
				row.redirect && (temp.redirect = row.redirect);
				temp.meta = {
					icon: row.icon,
					title: row.title,
					isLink: row.is_link,
					isHide: row.is_hide === 1 ? true : false,
					isFull: row.is_full === 1 ? true : false,
					isAffix: row.is_affix === 1 ? true : false,
					isKeepAlive: row.is_keep_alive === 1 ? true : false,
				};
				data.push(temp);
			});
			data = tranListToTreeData(data).sort((a, b) => a.id - b.id);
			res.send({
				code: 200,
				data,
				msg: "成功",
			});
        } catch (error) {
            console.log(error);          
        }
	},
    // 添加权限
    async addAuthHandle(req, res) {
        try {
            // 添加 权限 数据
            const { path, name, meta, parentId, component, isMenu } = req.body
            const addAuthSql = `
                INSERT INTO menu_list (parent_id, path, name, component, is_menu) VALUES (${parentId}, '${path}', '${name}', '${component}', ${isMenu?1:0})
            `
            const addAuthRes = await queryAsync(addAuthSql)
            if(!addAuthRes.affectedRows) return res.cc("操作失败")

            // 添加权限 meta 数据
            const {insertId} = addAuthRes
            const { icon, title, isLink, isHide, isFull, isAffix, isKeepAlive } = meta
            const addAuthMetaSql = `
                INSERT INTO menu_meta_list (main_id, icon, title, is_link, is_hide, is_full, is_affix, is_keep_alive) 
                    VALUES (${insertId}, '${icon}', '${title}', '${isLink}', ${isHide}, ${isFull}, ${isAffix}, ${isKeepAlive})
            `
            const addAuthMetaRes = await queryAsync(addAuthMetaSql)
            if(!addAuthMetaRes.affectedRows) return res.cc("操作失败")

            // 查询当前添加的权限的父级是否有启用的 redirect 
            const allAuthList = await queryAsync("SELECT * FROM menu_list WHERE status=1")
            // 当前添加权限的父级菜单
            const currParentAuth = allAuthList.find(v => v.id === parentId)
            // 当前权限的同级权限 path 数组
            const siblingAuthPaths = allAuthList.filter(v => v.parent_id === parentId).sort((a,b) => a.id - b.id).map(v => v.path)
            if(!currParentAuth.redirect || !siblingAuthPaths.includes(currParentAuth.redirect)){
                const updateRedirectRes = await queryAsync(`UPDATE menu_list SET redirect='${siblingAuthPaths[0]}' WHERE id=${parentId}`)
                if(!updateRedirectRes.affectedRows) return res.cc('操作失败')
            }
            return res.cc("操作成功", 200)
        } catch (error) {
            console.log(error);
        }
    },
    // 修改权限
    async editAuthHandle(req, res) {
        const { id, path, name, meta, parentId, component } = req.body
        const updateAuthRes = await queryAsync(`UPDATE menu_list SET parent_id='${parentId}', path='${path}', name='${name}', component='${component}' WHERE id=${id}`)
        if(!updateAuthRes.affectedRows) return res.cc("操作失败")
        const {icon, title, isLink, isHide, isFull, isAffix, isKeepAlive} = meta
        const updateAuthMetaRes = await queryAsync(`UPDATE menu_meta_list SET icon='${icon}', title='${title}', is_link='${isLink}', is_hide=${isHide}, is_full=${isFull}, is_affix=${isAffix}, is_keep_alive=${isKeepAlive} WHERE main_id=${id}`)
        if(!updateAuthMetaRes.affectedRows) return res.cc("操作失败")
        return res.cc("操作成功", 200) 
    },
    // 删除权限（软删除）
    async delAuthHandle(req, res) {
        const deleteAuthRes = await queryAsync(`UPDATE menu_list SET status=0 WHERE id=${Number(req.query.id)} OR parent_id=${Number(req.query.id)}`)
        if(!deleteAuthRes.affectedRows) return res.cc("操作失败");
        return res.cc("操作成功", 200)
    },
    
    // 角色列表
    async getRoleList(req, res) {
        let { pageNum, pageSize } = req.query
        pageNum = pageNum || 1
        pageSize = pageSize || 10
        const roleList = await queryAsync(`SELECT * FROM role_list WHERE status=1 LIMIT ${pageSize} OFFSET ${ (pageNum - 1) * pageSize }`)
        const [{total}] = await queryAsync(`SELECT COUNT(*) as total FROM role_list WHERE status=1`)
        const datalist = roleList.map(v => {
            return {    
                ...v, 
                roleName: v.role_name, 
                roleDesc: v.role_desc, 
                authIds: v.auth_ids, 
                addTime: v.add_time
            }
        })
        res.send({
            code: 200,
            msg: "ok",
            data: {
                datalist,
                pageNum: Number(pageNum),
                pageSize: Number(pageSize),
                total 
            }
        })
    },
    // 添加角色
    addRoleHandle(req, res) {   
        const { roleName, roleDesc, authIds } = req.body
        const sqlStr = `
            INSERT INTO role_list (role_name, role_desc, add_time, auth_ids)
                VALUES ('${roleName}','${roleDesc}','${moment().format('YYYY-MM-DD HH:mm:ss')}','${authIds.join(',')}')
        `
        db.query(sqlStr, (err, result) => {
            if(!result.affectedRows) return res.cc("操作失败")
            return res.cc("操作成功", 200) 
        })
    },
    // 修改角色
    editRoleHandle(req, res) {   
        const { id, roleName, roleDesc, authIds } = req.body
        const sqlStr = `
            UPDATE role_list SET role_name='${roleName}', role_desc='${roleDesc}', auth_ids='${authIds.join(',')}' WHERE id=${id}
        `
        db.query(sqlStr, (err, result) => {
            if(!result.affectedRows) return res.cc("操作失败")
            return res.cc("操作成功", 200) 
        })
    },
    // 删除角色
    async delRoleHandle(req, res) {
        const deleteRoleRes = await queryAsync(`UPDATE role_list SET status=0 WHERE id=${Number(req.query.id)}`)
        if(!deleteRoleRes.affectedRows) return res.cc("操作失败");
        return res.cc("操作成功", 200)
    },
    
    // 后台管理员列表
    async getBgAdminList(req, res) {
        const { pageNum, pageSize } = req.query
        const list = await queryAsync(`SELECT * FROM user_list WHERE status=1 LIMIT ${pageSize} OFFSET ${ (pageNum - 1) * pageSize }`)
        const [{total}] = await queryAsync(`SELECT COUNT(*) as total FROM user_list WHERE status=1`)
        const datalist = list.map(v => {
            delete v.password
            return v
        })
        res.send({
            data: {
                datalist,
                pageNum: Number(pageNum),
                pageSize: Number(pageSize),
                total
            }
        })
    }
}