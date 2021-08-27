const { exec } = require('../db/mysql');

const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `;
  if (author) {
    sql += `and author='${author}' `;
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc`;
  console.log(123);
  return exec(sql);
}

const getDetail = id => {
  const sql = `select * from blogs where id='${id}'`
  return exec(sql).then(rows => rows[0]);
}

const newBlog = postData => {
  const { title, content, author } = postData;
  const createTime = Date.now();
  const sql = `
    insert into blogs (title, content, createTime, author)
    values ('${title}', '${content}', ${createTime}, '${author}')
  `;
  return exec(sql).then(insertData => {
    return { id: insertData.insertId };
  })
}

const updateBlog = (id, postData = {}) => {
  const { title, content } = postData;
  const sql = `
    update blogs set title='${title}',content='${content}' where id=${id};
  `;
  return exec(sql).then(updateData => {
    return updateData.affectedRows > 0;
  })
}

const deleteBlog = (id, author) => {
  const sql = `delete from blogs where id=${id} and author='${author}'`;
  return exec(sql).then(delData => {
    return delData.affectedRows > 0;
  });
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  deleteBlog
}