import buildbranch from "buildbranch";
import rimraf from "rimraf";
import each from "each-done";
import fs from "fs-extra";
import numbers from "typographic-numbers";
import numd from "numd";
import ramda from "ramda";
import autoprefixer from "autoprefixer";
import pcssImport from "postcss-import";
import pcssInitial from "postcss-initial";
import webpack from "webpack";

import gulp from "gulp";
import gulpJade from "gulp-jade";
import rename from "gulp-rename";
import jimp from "gulp-jimp";
import gulpUtil from "gulp-util";
import postcss from "gulp-postcss";

import articleData from "article-data";
import getStats from "./stats.js";
import packageJSON from "./package.json" assert { type: "json" };
import webpackConfig from "./webpack.config.babel.js";

import authorRender from "./helpers/author-render.js";
import bust from "./helpers/bust.js";
import lastUpdated from "./helpers/last-updated.js";

import authors from "./dump/index.js";

const latestInfo = ramda.head(authors).info;

const task = gulp.task.bind(gulp);

const jadeDefaults = {
	pretty: true,
	locals: {
		site: packageJSON.site,
		latestInfo,
		numbers: (input) => numbers(input, { locale: "ru" }),
		people: numd("человек", "человека", "человек"),
	},
};

const getOptions = (opts = {}) =>
	Object.assign({}, jadeDefaults, opts, {
		locals: Object.assign({}, jadeDefaults.locals, opts.locals),
	});

const jade = (opts) => gulpJade(getOptions(opts));

/**
 * MAIN TASKS
 */
task("index", () => {
	const authorsToPost = authors.filter((author) => author.post !== false);
	return gulp
		.src("layouts/index.jade")
		.pipe(
			jade({
				locals: {
					title: `Сайт @${packageJSON.site.title}`,
					desc: packageJSON.site.description,
					currentAuthor: ramda.head(authors),
					authors: authorsToPost,
					helpers: { authorRender, bust },
				},
			}),
		)
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("stats", () => {
	const currentAuthor = ramda.head(
		authors.filter((author) => author.post === false),
	);
	return gulp
		.src("layouts/stats.jade")
		.pipe(
			jade({
				locals: {
					title: `Статистика @${packageJSON.site.title}`,
					url: "stats/",
					desc: packageJSON.site.description,
					lastUpdated,
					stats: getStats(authors),
					currentAuthor: currentAuthor,
					helpers: { bust },
				},
			}),
		)
		.pipe(rename({ dirname: "stats" }))
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("about", () => {
	const readme = fs.readFileSync("./pages/about.md", { encoding: "utf8" });
	const article = articleData(readme, "D MMMM YYYY", "en"); // TODO change to 'ru' after moment/moment#2634 will be published
	return gulp
		.src("layouts/article.jade")
		.pipe(
			jade({
				locals: Object.assign({}, article, {
					title: "О проекте",
					url: "about/",
					helpers: { bust },
				}),
			}),
		)
		.pipe(rename({ dirname: "about" }))
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("authoring", () => {
	const readme = fs.readFileSync("./pages/authoring.md", { encoding: "utf8" });
	const article = articleData(readme, "D MMMM YYYY", "en"); // TODO change to 'ru' after moment/moment#2634 will be published
	return gulp
		.src("layouts/article.jade")
		.pipe(
			jade({
				locals: Object.assign({}, article, {
					title: "Авторам",
					url: "authoring/",
					helpers: { bust },
				}),
			}),
		)
		.pipe(rename({ dirname: "authoring" }))
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("instruction", () => {
	const readme = fs.readFileSync("./pages/instruction.md", {
		encoding: "utf8",
	});
	const article = articleData(readme, "D MMMM YYYY", "en"); // TODO change to 'ru' after moment/moment#2634 will be published
	return gulp
		.src("layouts/article.jade")
		.pipe(
			jade({
				locals: Object.assign({}, article, {
					title: "Инструкция",
					url: "instruction/",
					helpers: { bust },
				}),
			}),
		)
		.pipe(rename({ dirname: "instruction" }))
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("map", () => {
	const currentAuthor = ramda.head(
		authors.filter((author) => author.post === false),
	);
	const authorsToPost = authors.filter((author) => author.post !== false);
	return gulp
		.src("layouts/map.jade")
		.pipe(
			jade({
				locals: {
					title: `Карта @${packageJSON.site.title}`,
					url: "map/",
					desc: packageJSON.site.description,
					currentAuthor: currentAuthor,
					authors: authorsToPost,
					helpers: { bust },
				},
			}),
		)
		.pipe(rename({ dirname: "map" }))
		.pipe(rename({ basename: "index" }))
		.pipe(gulp.dest("dist"));
});

task("authors", (done) => {
	const authorsToPost = authors.filter((author) => author.post !== false);
	each(
		authorsToPost,
		(author) => {
			try {
				return gulp
					.src("./layouts/author.jade")
					.pipe(
						jade({
							pretty: true,
							locals: {
								title: `Неделя @${author.username} в @${packageJSON.site.title}`,
								author,
								helpers: { authorRender, bust },
							},
						}),
					)
					.pipe(rename({ dirname: author.username }))
					.pipe(rename({ basename: "index" }))
					.pipe(gulp.dest("dist"));
			} catch (e) {
				console.log(author.username, e);

				throw e;
			}
		},
		done,
	);
});

task("userpics", () => {
	return gulp
		.src("dump/images/*-image*")
		.pipe(jimp({ "": { resize: { width: 192, height: 192 } } }))
		.pipe(gulp.dest("dist/images"));
});

task("banners", () =>
	gulp
		.src("dump/images/*-banner*")
		.pipe(jimp({ "": {} }))
		.pipe(gulp.dest("dist/images")),
);

task("current-userpic", () =>
	gulp
		.src(`dump/images/${ramda.head(authors).username}-image*`)
		.pipe(jimp({ "": { resize: { width: 192, height: 192 } } }))
		.pipe(rename("current-image"))
		.pipe(gulp.dest("dist/images")),
);

task("current-banner", () =>
	gulp
		.src(`dump/images/${ramda.head(authors).username}-banner*`)
		.pipe(jimp({ "": {} }))
		.pipe(rename("current-banner"))
		.pipe(gulp.dest("dist/images")),
);

task("css", () =>
	gulp
		.src("css/styles.css")
		.pipe(postcss([pcssImport, pcssInitial, autoprefixer]))
		.pipe(gulp.dest("dist/css")),
);

task("js", (done) => {
	webpack(webpackConfig, (err, stats) => {
		if (err) throw new gulpUtil.PluginError("webpack", err);
		done();
	});
});

task("static", () =>
	gulp
		.src(["static/**", "static/.**", "node_modules/bootstrap/dist/**"])
		.pipe(gulp.dest("dist")),
);

/**
 * FLOW
 */
task("clean", (done) => rimraf("dist", done));

task(
	"html",
	gulp.series(
		"stats",
		"authors",
		"index",
		"map",
		"about",
		"authoring",
		"instruction",
	),
);

task(
	"build",
	gulp.series(
		"css",
		"js",
		"static",
		"html",
		"userpics",
		"banners",
		"current-userpic",
		"current-banner",
	),
);

task("done", (done) =>
	buildbranch({ branch: "gh-pages", folder: "dist" }, done),
);

task("deploy", gulp.series("clean", "build", "done"));
