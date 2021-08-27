const { 
  getList, 
  getDetail, 
  newBlog,
  updateBlog,
  deleteBlog
 } = require('../controller/blog');
const { SuccessModel, ErrorModel } = require('../model/resModel');

const loginCheck = (req) => {
  if (!req.session.username) {
    return Promise.resolve(
      new ErrorModel('尚未登录')
    )
  }
}

const handleBlogRouter = (req, res) => {
  const method = req.method;
  const id = req.query.id;

  if (method === 'GET' && req.path === '/api/blog/list') {
    const { keyword, isadmin } = req.query;
    let author = req.query.author;
    if (isadmin) {
      const loginCheckResult = loginCheck(req);
      if (loginCheckResult) {
        return loginCheckResult;
      }
      author = req.session.username;
    }
    const result = getList(author, keyword);
    return result.then(listData => {
      return new SuccessModel(listData);
    });
  }

  if (method === 'GET' && req.path === '/api/blog/detail') {
    const result = getDetail(id);
    return result.then(data => {
      return new SuccessModel(data);
      
    });
  }

  if (method === 'POST' && req.path === '/api/blog/new') {
    const loginCheckResult = loginCheck(req);
    if (loginCheckResult) {
      return loginCheckResult;
    }
    req.body.author = req.session.username;
    const result = newBlog(req.body);
    return result.then(data => {
      return new SuccessModel(data);
    });
  }

  if (method === 'POST' && req.path === '/api/blog/update') {
    const loginCheckResult = loginCheck(req);
    if (loginCheckResult) {
      return loginCheckResult;
    }
    const result = updateBlog(id, req.body);
    return result.then(val => {
      if (val) {
        return new SuccessModel();
      }
      return new ErrorModel('更新博客失败');
    })
  }

  if (method === 'POST' && req.path === '/api/blog/del') {
    const loginCheckResult = loginCheck(req);
    if (loginCheckResult) {
      return loginCheckResult;
    }
    const result = deleteBlog(id, req.session.username);
    return result.then(val => {
      if (val) {
        return new SuccessModel();
      }
      return new ErrorModel('删除博客失败');
    })
  }
}

module.exports = handleBlogRouter;