// 将扁平数组转为树形结构
function tranListToTreeData(list, rootValue = 0) {
	const array = [];
	list.forEach(item => {
		if (item.parentId === rootValue) {
			const children = tranListToTreeData(list, item.id).sort((a, b) => a.id - b.id);
			children.length && (item.children = children);
			array.push(item);
		}
	});
	return array;
}

module.exports = {
    tranListToTreeData
}