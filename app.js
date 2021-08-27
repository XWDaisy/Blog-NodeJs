const querystring = require('querystring');

const handleUserRouter = require('./src/router/user');
const handleBlogRouter = require('./src/router/blog');
const { get, set } = require('./src/db/redis');


const getPostData = req => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({});
      return;
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({});
      return;
    }
    let postData = '';
    req.on('data', chunk => {
      postData += chunk;
    })
    req.on('end', () => {
      if (!postData) {
        resolve({});
        return;
      }
      resolve(JSON.parse(postData))
    })
  });
  return promise;
}

const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
  console.log(d.toGMTString());
  return d.toGMTString();
}



const serverHandle = (req, res) => {
  res.setHeader('Content-type', 'application/json');

  const url = req.url;
  req.path = url.split('?')[0];
  req.query = querystring.parse(url.split('?')[1]);

  req.cookie = {};
  const cookieStr = req.headers.cookie || '';
  cookieStr.split(';').forEach(item => {
    if (!item) { return }
    const arr = item.split('=');
    const key = arr[0].trim();
    const value = arr[1].trim();
    req.cookie[key] = value;
  });

  // let userId = req.cookie.userid;
  // let needSetCookie = false;
  // if (userId) {
  //   if (!SESSION_DATA[userId]) {
  //     SESSION_DATA[userId] = {}
  //   }
  // } else {
  //   needSetCookie = true;
  //   userId = `${Date.now()}_${Math.random()}`
  //   SESSION_DATA[userId] = {}
  // }
  // console.log('SESSION_DATA', SESSION_DATA);
  // req.session = SESSION_DATA[userId];
  // console.log('req.session', req.session);

  let userId = req.cookie.userid;
  let needSetCookie = false;
  if (!userId) {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`
    set(userId, {});
  }
  req.sessionId = userId;
  get(req.sessionId).then(sessionData => {
    if (sessionData == null) {
      set(req.sessionId, {});
      req.session = {};
    } else {
      req.session = sessionData
    }
    return getPostData(req);
  }).then(postData => {
    req.body = postData;

    const blogResult = handleBlogRouter(req, res);
    if (blogResult) {
      blogResult.then(blogData => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
        }
        res.end(JSON.stringify(blogData));
      });
      return;
    }

    const userResult = handleUserRouter(req, res);
    if (userResult) {
      userResult.then(userData => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
        }
        res.end(JSON.stringify(userData));
      })
      return;
    }

    res.writeHeader('404', { 'Content-type': 'text/plain' });
    res.write('404 not found');
    res.end();
  })
}

module.exports = serverHandle;

// /usr/local/etc/nginx/nginx.conf

// nginx -t

// nginx -s reload
// nginx -s stop
