var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin"),
	path = require('path'),
	webpack = require('webpack'),
	fs = require('fs'),
	uglifyJsPlugin = webpack.optimize.UglifyJsPlugin,
	destFiles = 'build_tmp/js/',
	srcDir = path.resolve(process.cwd(), 'src');

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
	var jsPath = path.resolve(srcDir, 'js');
	var dirs = fs.readdirSync(jsPath);
	var matchs = [],
		files = {};
	dirs.forEach(function(item) {
		matchs = item.match(/(.+)\.js$/);
		console.log(matchs);
		if(matchs) {
			files[matchs[1]] = path.resolve(srcDir, 'js', item);
		}
	});
	console.log(JSON.stringify(files));
	return files;
}

module.exports = {
	cache: true,
	devtool: "source-map",
	entry: getEntry(),
	output: {
		path: path.join(__dirname, destFiles),
		publicPath: destFiles,
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	resolve: {
		alias: {
			jquery: srcDir + "/js/lib/jquery.min.js",
			core: srcDir + "/js/core",
			ui: srcDir + "/js/ui"
		}
	},
	plugins: [
		new CommonsChunkPlugin('common.js') //,
		//		new uglifyJsPlugin({
		//			compress: {
		//				warnings: false
		//			}
		//		})
	]
};