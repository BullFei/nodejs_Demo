/*
	前后端交互 ajax
*/

const express = require("express");
const router = express.Router();
//引入数据库模型
const User = require("../models/User");
const Content = require("../models/Content")


/*
	定义一个统一数据返回格式
*/
var responseData;

router.use(function(req, res, next){
	responseData = {
		code: 0,     //错误码
		message: ""  //信息
	}
	next();
})

/*
	bodyParser

	用户注册
	我要获取到提交过来的post数据
	引入bodyParser模块以后，
	我们req上，会自动增加一个属性，这个属性叫做body
	这个属性就是我们post提交的数据
*/
router.post("/user/register", function(req, res, next){
	// console.log("注册");
	/*
		处理post提交过来的数据
	*/
	console.log(req.body);

	/*
		下面编写注册逻辑

		1、基本的注册逻辑判断
			(1)用户名不能为空
			(2)密码不能为空
			(3)两次输入的密码必须一致

		2、和数据库中的数据进行比对，判断是否被注册了
			(1)数据库的查询

	*/
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;

	//用户名是否为空
	if(username == ""){
		responseData.code = 1;
		responseData.message = "用户名不能为空";
		res.json(responseData);
		return;
	}

	//密码不能为空
	if(password == ""){
		responseData.code = 2;
		responseData.message = "密码不能为空";
		res.json(responseData);
		return;
	}

	//两次输入的密码不一致
	if(password != repassword){
		responseData.code = 3;
		responseData.message = "两次输入的密码不一致";
		res.json(responseData);
		return;
	}

	/*
		用户名是否已经被注册了
		异步串行
		Promise  Mongoose每一个函数都是的返回值一个Promise
	*/
	User.findOne({
		username: username
	}).then(function(userInfo){
		// console.log(userInfo);
		if(userInfo){
			//表示数据库有该记录
			responseData.code = 4;
			responseData.message = "用户名已经被注册了";
			res.json(responseData);
			return;
		}

		//保存userInfo
		var user = new User({
			username: username,
			password: password
		});

		//保存到数据库中
		return user.save();
	}).then(function(newUserInfo){
		// console.log(newUserInfo);
		responseData.message = "注册成功";
		res.json(responseData);
		return;
	})
})

/*
	新增登录的路由
*/
router.post("/user/login", function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;

	if(username == "" || password == ""){
		responseData.code = 1;
		responseData.message = "用户名和密码不能为空";
		res.json(responseData);
		return;
	}
	/*
		数据库验证
	*/
	User.findOne({
		username: username,
		password: password
	}).then(function(userInfo){
		if(!userInfo){
			responseData.code = 2;
			responseData.message = "用户名或密码错误";
			res.json(responseData);
			return;
		}

		//用户名和密码都正确
		//将登录信息返回前端页面
		responseData.message = "登录成功";
		responseData.userInfo = {
			_id: userInfo._id,
			username: userInfo.username
		};

		//将cookies存储
		req.cookies.set("userInfo", JSON.stringify({
			_id: userInfo._id,
			username: userInfo.username
		}))
		res.json(responseData);
		return;
	})
})

/*
	退出
*/
router.get("/user/logout", function(req, res){
	//将cookie删除
	req.cookies.set("userInfo", null);
	res.json(responseData);
})

/*
	评论提交
*/
router.post("/comment/post", function(req, res){
	//内容id
	var contentId = req.body.contentid || "";
	var content = req.body.content || "";

	var postData = {
		username: req.userInfo.username,
		postTime: new Date(),
		content: content
	}

	//查询当前这篇内容的信息
	Content.findOne({
		_id: contentId
	}).then(function(content){
		//插入本次提交的数据，并保存
		content.comments.push(postData);
		return content.save();
	}).then(function(newContent){
		responseData.message = "评论成功";
		responseData.data = newContent;
		res.json(responseData);
	})
})

module.exports = router;





















