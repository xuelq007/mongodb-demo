const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Monk = require('monk');
const ObjectID = require('mongodb').ObjectID;
// 创建一个Koa对象表示web app本身:
const app = new Koa();
const router=new Router();
const db=new Monk('localhost:27017/myproject');//链接到库
const blogCollection = db.get('document');//表
const account = db.get('account');


// 打印request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});


// 对于任何请求，app将调用该异步函数处理请求：
router.get('/api', async ( ctx ) => {
  ctx.response.type = 'text/html';
  ctx.body = 'hi'
})

router.get('/api/getList', async ( ctx ) => {
  let data = await blogCollection.find();
  ctx.response.type = 'application/json';
  ctx.body = data;
})

router.get('/api/getCategory', async ( ctx ) => {
  let data = await blogCollection.distinct('category');
  ctx.response.type = 'application/json';
  ctx.body = data;
})

router.post('/api/validateUser', async ( ctx ) => {
  let dbAccount = await account.find();
  ctx.response.type = 'application/json';

  let user = ctx.request.body.user;
  let password = ctx.request.body.password;

  if (dbAccount[0].user === user && dbAccount[0].password === password) {
    ctx.body = {
      valid: true
    }
  } else {
    ctx.body = {
      valid: false
    }
  }
})

router.post('/api/addBlog', async ( ctx ) => {
  let blogName = ctx.request.body.blogName;
  let link = ctx.request.body.link;
  let category = ctx.request.body.category;

  let findOne = await blogCollection.findOne({name: blogName});

  if (findOne && findOne._id) {
    ctx.body = {
      success: false,
      error: '添加博客失败(已有同名博客)'
    }

    return;
  }

  let result = await blogCollection.insert(
    {
      name: blogName,
      link: link,
      category: category
    }
  );

  if (result._id) {
    ctx.body = {
      success: true
    }
  } else {
    ctx.body = {
      success: false,
      error: '添加博客失败'
    }
  }
})

router.post('/api/deleteBlog', async ( ctx ) => {
  let blogId = ctx.request.body.blogId;
  let result;

  try {
    result = await blogCollection.findOneAndDelete(
      {
        _id: ObjectID(blogId)
      }
    );
  } catch (e) {console.log(e.message)}

  if (!result) {
    ctx.body = {
      success: false,
      error: 'id不存在或不合法'
    };
  } else {
    ctx.body = {
      success: true
    };
  }
})

router.post('/api/updateBlog', async ( ctx ) => {
  let blogId = ctx.request.body.blogId;
  let blogName = ctx.request.body.blogName;
  let link = ctx.request.body.link;
  let category = ctx.request.body.category;

  let result;

  try {
    result = await blogCollection.findOneAndUpdate(
      {
        _id: ObjectID(blogId),

      },

      {
        name: blogName,
        link: link,
        category: category
      }
    );
  } catch (e) {console.log(e.message)}

  if (!result) {
    ctx.body = {
      success: false,
      error: 'id不存在或不合法'
    };
  } else {
    ctx.body = {
      success: true
    };
  }
})

router.post('/api/findBlog', async ( ctx ) => {
  let blogName = ctx.request.body.blogName;
  let data = await blogCollection.findOne({name: blogName});

  if (data) {
    ctx.body = {
      success: true,
      result: data
    }
  } else {
    ctx.body = {
      success: false,
      error: '该博客不存在'
    }
  }
})

// 进行requestbody解析
app.use(bodyParser());

// 加载路由中间件
//解释：app.use 加载用于处理http請求的middleware（中间件），当一个请求来的时候，会依次被这些 middlewares处理。
app.use(router.routes());

// 在端口3000监听:
app.listen(3000, () => {
  console.log('[myapp]已经运行，端口为3000')
})