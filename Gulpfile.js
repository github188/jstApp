var gulp = require('gulp'),
	gutil = require('gulp-util'),
	clean = require('gulp-clean'),
	htmlmin = require('gulp-htmlmin'), //HTML压缩
	sass = require('gulp-sass'), //SASS编译
	cleanCSS = require('gulp-clean-css'), //压缩CSS
	autoprefixer = require('gulp-autoprefixer'), //CSS自动添加前缀
	inlineSource = require('gulp-inline-source'), //html外链文件复制到HTML
	jshint = require('gulp-jshint'), //JS语法检查
	uglify = require('gulp-uglify'), //JS压缩
	rev = require('gulp-rev'), //文件加md5后缀
	notify = require('gulp-notify'), //完成后通知
	revCollector = require('gulp-rev-collector'), //替换HTML链接版本号
	fs = require('fs'),
	GulpSSH = require('gulp-ssh'), //传文件至远程服务器
	webpack = require('webpack'),
	webpackConfigDeploy = require('./webpack.config.deploy.js'),
	webpackConfigDev = require('./webpack.config.dev.js'), //webpack配置文件
	config = {

		//测试环境
		host: '10.101.130.8',
		port: 22,
		username: 'jst',
		password: 'Pw_jst8920',
		privateKey: fs.readFileSync('id_rsa_test_130_8'), //密钥
		filePath: "/home/jst/tomcat/app_8082/webapps/apph5/", //发布到哪儿去
	
		//开发环境
		//		host: '10.101.130.212',
		//		port: 22,
		//		username: 'jst',
		//		password: 'jst',
		//		privateKey: fs.readFileSync('id_rsa'), //密钥
		//		filePath: "/home/jst/product/app/apache-tomcat-8.0.36/webapps/app", //发布到哪儿去---开发环境

		backupPath: "/home/jst/tomcat/app_8082/webapps/" //发布之前备份目录
	}, //远程服务器
	cssDistFiles = ['src/**/*.css'], //源文件目录
	jsDistFiles = ['src/**/*.js'], //源文件目录
	destFiles = 'build',
	manifest = "manifest",
	destFilesTmp = 'build_tmp', //编译后临时目录
	jsDistFilesTmp = [destFilesTmp + '/**/*.js'],
	cssDistFilesTmp = [destFilesTmp + '/**/*.css'];

/**
 * -----------1---------------删除所有编译文件
 */
gulp.task('clean', function() {
	return gulp.src([destFiles, manifest, 'src/css_output'], {
			read: false
		})
		.pipe(clean());
});

//-----------2---------------编译SASS文件,保存至临时文件夹里
gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(destFilesTmp + '/css_output'));
});

//-----------3---------------引用webpack对js进行操作--发布模式--编译文件放在临时文件夹里
gulp.task("build-js-deploy", function(callback) {

	webpack(webpackConfigDeploy, function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build-js", err);
		gutil.log("[webpack:build-js]", stats.toString({
			colors: true
		}));
		callback();
	});

});
// -----------4---------------CSS文件加md5后缀，并生成替换map
gulp.task('css_md5', ['sass'], function() {
	return gulp.src(cssDistFilesTmp)
		.pipe(autoprefixer())
		.pipe(cleanCSS({
			compatibility: 'ie8'
		}))
		.pipe(rev())
		.pipe(gulp.dest(destFiles)) // 生成 name-md5.css
		.pipe(rev.manifest())
		.pipe(gulp.dest(manifest + '/css')); // 生成 rev-manifest.json(映射)

});
// -----------5---------------JS文件加md5后缀，并生成替换map
gulp.task('js_md5', ['build-js-deploy'], function() {
	return gulp.src(jsDistFilesTmp)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(rev())
		.pipe(gulp.dest(destFiles)) // 生成 name-md5.js
		.pipe(rev.manifest()) // 生成 rev-manifest.json(映射)
		.pipe(gulp.dest(manifest + '/js'));
});

// -----------6---------------压缩HTML下一步处理inline//
gulp.task('htmlmin', function() {

	var options = {
		removeComments: true, //清除HTML注释
		collapseWhitespace: true, //压缩HTML
		collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: false, //删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
		removeStyleLinkTypeAttributes: true //删除<style>和<link>的type="text/css"
			//		minifyJS: true, //压缩页面JS
			//		minifyCSS: true //压缩页面CSS
	};

	return gulp.src(['src/**/*.html'])
		.pipe(htmlmin(options))
		.pipe(gulp.dest(destFilesTmp));
});

// -----------7---------------编译SCSS，WEBPACK JS，移动html文件后，此步就给HTML文件添加md5引用
gulp.task('html_md5', ['css_md5', 'js_md5', 'htmlmin'], function() {
	return gulp.src([manifest + '/**/*.json', destFilesTmp + '/**/*.html'])
		.pipe(revCollector())
		.pipe(gulp.dest(destFiles));
});

//-----------8---------------给HTML文件添加md5引用后，将HTML文件引用的JS,CSS添加至页面
gulp.task('inlinesource', ['html_md5'], function() {
	return gulp.src([destFiles + '/**/*.html'])
		.pipe(inlineSource({
			compress: false
		}))
		.pipe(gulp.dest(destFiles));
});

//-----------9---------------将第三方JS移至目标文件夹
gulp.task('move-vendors-js', function() {
	return gulp.src(['src/**/vendors/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(gulp.dest(destFiles));
});

// 移动图片
gulp.task('move_png', function() {
	return gulp.src(['src/**/*.png', 'src/**/*.gif', 'src/**/*.jpg'])
		.pipe(gulp.dest(destFiles));
});

//-----------10---------------将文件部署至远程服务器
var gulpSSH = new GulpSSH({
	ignoreErrors: false,
	sshConfig: config
});
//将原来的版本备份
gulp.task('exec', function() {

	Date.prototype.Format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份   
			"d+": this.getDate(), //日   
			"h+": this.getHours(), //小时   
			"m+": this.getMinutes(), //分   
			"s+": this.getSeconds(), //秒   
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
			"S": this.getMilliseconds() //毫秒   
		};
		if(/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};

	var todayDate = new Date().Format("yyyyMMddhms"),
		cssBackupFile = config.filePath + "css_output ",
		imgBackupFile = config.filePath + "img ",
		jsBackupFile = config.filePath + "js ",
		pageBackupFile = config.filePath + "page ",
		backupHome = config.backupPath + "apph5_backup_." + todayDate;
	return gulpSSH
		.exec(["mkdir " + backupHome, "mv " + cssBackupFile + imgBackupFile + jsBackupFile + pageBackupFile + backupHome], {
			filePath: 'commands.log'
		})
		.on('error', function(err) {
			gutil.log('exec Error!', err.message);
			this.end();
		})
		.pipe(gulp.dest('logs'));
});

//备份之后将文件传至服务器
gulp.task('deploy_server', ['inlinesource', 'move-vendors-js', 'move_png', 'exec'], function() {
	return gulp
		.src(destFiles + '/**/*')
		.pipe(gulpSSH.dest(config.filePath))
});

//-----------11---------------删掉临时文件夹,在此之前确保所有工作已完成
gulp.task('clean-tmp', ['deploy_server'], function() {
	return gulp.src([destFilesTmp, manifest], {
			read: false
		})
		.pipe(clean())
		.pipe(notify({
			message: 'clean-tmp task complete,此时应该发布完成，请检查发布结果'
		}));
});

// 开始发布任务
gulp.task('deploy', ['clean'], function() {
	gulp.start(['clean-tmp']);
});

//================================deploy finished=========================

//================================deploy APP=========================

var appPath = '../js-app-1.0.1/',
	appSrcPath = [destFiles + '/**/*', 'manifest.json', 'unpackage**/**/*'];

//打包APP之前，先清除之前的文件
gulp.task('clean-befrore-deploy-app', function() {
	return gulp.src([destFiles, manifest, destFilesTmp, appPath + "*"], {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});

// 移动编译好之后的文件
gulp.task('move_app', ['inlinesource', 'move-vendors-js', 'move_png'], function() {
	return gulp.src(appSrcPath)
		.pipe(gulp.dest(appPath));
});

//清除临时文件夹，并打包
gulp.task('clean-app', ['move_app'], function() {
	return gulp.src([destFilesTmp, manifest], {
			read: false
		})
		.pipe(clean({
			force: true
		}))
		.pipe(notify({
			message: 'clean-app task complete,此时应该发布完成，请检查发布结果'
		}));
});

// 编译符合APP的文件
gulp.task('app-deploy', ['clean-befrore-deploy-app'], function() {
	gulp.start(['clean-app']);
});
//----------------------

// 移动编译好之后的文件
gulp.task('move_app-dev', ['move_file_dev', 'build-js-dev', 'move-vendors-js'], function() {
	return gulp.src(appSrcPath)
		.pipe(gulp.dest(appPath));
});

//监听文件变化
gulp.task('watch-app', function(done) {
	gulp.watch('src/**/*', ['move_app-dev'])
		.on('监听--APP文件变化了---move_file end', done);
});

// 打包开发阶段APP的文件，不压缩方便调试
gulp.task('app-dev', ['clean-befrore-deploy-app'], function() {
	gulp.start(['move_app-dev', 'watch-app']);
});

//================================deploy APP finished=========================

//================================下面是开发阶段=========================
//引用webpack对js进行操作--开发模式
gulp.task("build-js-dev", function(callback) {

	webpack(webpackConfigDev, function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build-js", err);
		gutil.log("[webpack:build-js]", stats.toString({
			colors: true
		}));
		callback();
	});

});

// 移动CSS文件
gulp.task('move_css', ['sass'], function() {
	return gulp.src([destFilesTmp + '/**/*.css'])
		.pipe(gulp.dest(destFiles));
});

// 移动html文件
gulp.task('move_html', function() {
	return gulp.src(['src/**/*.html'])
		.pipe(gulp.dest(destFiles));
});

// 开发时只需移动HTML，css,png就可以了
gulp.task('move_file_dev', ['sass'], function() {
	return gulp.src(['src/**/*.html', destFilesTmp + '/**/*.css', 'src/**/*.png'])
		.pipe(gulp.dest(destFiles));
});

//监听文件变化
gulp.task('watch', function(done) {
	gulp.watch('src/**/*.scss', ['move_css'])
		.on('监听--SCSS变化了---move_css end', done);

	gulp.watch('src/**/*.html', ['move_html'])
		.on('监听--HTML变化了---move_html end', done);

	gulp.watch('src/**/*.png', ['move_png'])
		.on('监听--PNG变化了---move_png end', done);

	gulp.watch('src/**/*.js', ['build-js-dev'])
		.on('监听--JS变化了---build-js-dev end', done);
});

//将JS文件内嵌至HTML
gulp.task('inlinesource-dev', ['move_file_dev', 'build-js-dev', 'move-vendors-js'], function() {
	return gulp.src([destFiles + '/**/*.html'])
		.pipe(inlineSource({
			compress: false
		}))
		.pipe(gulp.dest(destFiles));
});

//开发
gulp.task('dev', ['clean'], function() {
	gulp.start(['move_file_dev', 'build-js-dev', 'move-vendors-js', "watch"]);
	//	gulp.start(['inlinesource-dev', "watch"]);
});

gulp.task('css_autoprefixer', function() {
	return gulp.src('src/css/**/*.css')
		.pipe(autoprefixer())
		.pipe(cleanCSS({
			compatibility: 'ie8'
		}))
		.pipe(gulp.dest(destFiles));

});