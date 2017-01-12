var gulp = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var css = require("gulp-clean-css");
var html = require("gulp-htmlmin");
var htmlmin = require("gulp-minify-html");
var image = require("gulp-imagemin");
var rev = require("gulp-rev");
var revCollector = require("gulp-rev-collector");
var usemin = require("gulp-usemin");


var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
};



var path = {
	sass: "./input/**/*.scss",
	css: "./css/**/*.css",
	html: ["./**/*.html","!./**/*.min.html"],
	image: "./images/**/*.{png,jpg,gif,ico}"
}

gulp.task("cleanAll",function(){
	return del(['output'])
});

gulp.task("sass",['cleanAll'],function(){
	return gulp.src(path.sass)
	.pipe(sass())
	.pipe(gulp.dest('css'))
});

gulp.task("css",['sass'],function(){
	return gulp.src(path.css)
	.pipe(css())
	.pipe(rev())
	.pipe(gulp.dest('output/css'))
	.pipe(rev.manifest())
	.pipe(gulp.dest('rev/css'))
});

gulp.task("cleanCss",['css'],function(){
	return del(['output/sass-css'])
});

gulp.task("imagemin",['cleanCss'],function(){
	return gulp.src(path.image)
	.pipe(image({
		optimizationLevel:5,
		progressive: true, 
        interlaced: true, 
        multipass: true 
	}))
	.pipe(rev())
	.pipe(gulp.dest('output/images'))
	.pipe(rev.manifest())
	.pipe(gulp.dest('rev/images'))
});

// gulp.task("html",["rev"],function(){
// 	return gulp.src(path.html)
// 	.pipe(html(options))
// 	.pipe(rev())
// 	.pipe(gulp.dest('./output'))
// 	.pipe(rev.manifest())
// 	.pipe(gulp.dest('rev'))
// });

gulp.task('rev1',["imagemin"], function() {
    gulp.src(['./rev/**/*.json', './**/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                'css': 'css',
                'images': 'images',
                'js': 'js'
            }
        }) )
        .pipe(html(options))
		.pipe(rev())
		.pipe(gulp.dest('./output'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('rev'))
});

gulp.task('rev2',["rev1"], function() {
    gulp.src(['./rev/**/*.json', './output/css/**/*.css'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                'images': 'images'
            }
        }) )
        .pipe(gulp.dest('./output/css'));
});

gulp.task('rev3',["rev2"], function() {
    gulp.src(['./rev/**/*.json', './output/js/**/*.js'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                'css': 'css',
                'images': 'images',
                'js': 'js'
            }
        }) )
        .pipe(gulp.dest('./output/js'));
});




gulp.task('default',["cleanAll","sass","css","cleanCss","imagemin","rev1","rev2","rev3"]);