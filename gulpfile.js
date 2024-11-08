﻿'use strict';

const gulp = require('gulp'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    htmlmin = require('gulp-htmlmin'),
    terser = require('gulp-terser'),
    gzip = require('gulp-gzip'),
    del = require('del'),
    fs = require('fs'),
    postcss = require('gulp-postcss'),
    purgecss = require('@fullhuman/postcss-purgecss'),
    bundleconfig = require('./bundleconfig.json');
    const rename = require('gulp-rename');
    const path = require('path');
    const glob = require('glob');
    const merge = require('merge-stream');

const regex = {
    css: /\.css$/,
    html: /\.(html|htm)$/,
    js: /\.js$/
};

// Helper function to check if file exists
function fileExists(path) {
    return fs.existsSync(path);
}

// JavaScript minification - single task without merge-stream
gulp.task('min:js', async function () {
    return merge(getBundles(regex.js).map(bundle => {
        return gulp.src(bundle.inputFiles, { base: '.' })
            .pipe(concat(bundle.outputFileName))
            .pipe(terser({
                compress: {
                    drop_console: true // Remove console logs
                },
                mangle: false, // Do not rename variables
                output: {
                    comments: false // Remove comments
                }
            }))
            .pipe(gulp.dest('.'))
            .on('end', () => console.log(`Created: ${bundle.outputFileName}`));
    }));
});
// CSS minification with PurgeCSS - single task without merge-stream
gulp.task('min:css', function () {
    const cssBundles = getBundles(regex.css);
    if (cssBundles.length === 0) return Promise.resolve(); // Skip if no CSS bundles

    // Get the list of .cshtml files in the Views directory
    const cshtmlFiles = glob.sync('./Views/**/*.cshtml');

    // Get the list of .js files in the wwwroot/js directory
    const jsFiles = glob.sync('./wwwroot/js/**/*.js');;

    // Combine the files for PurgeCSS
    const contentFiles = [
        ...cshtmlFiles,
        ...jsFiles
    ];

    return gulp.src(cssBundles[0].inputFiles, { base: '.' })
        .pipe(concat(cssBundles[0].outputFileName))
        .pipe(postcss([
            purgecss({
                content: contentFiles,
                defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
            })
        ]))
        .pipe(gulp.src('./wwwroot/abogacia.css')) // Include abogacia.css directly
        .pipe(concat(cssBundles[0].outputFileName)) // Concatenate abogacia.css with the processed output
        .pipe(cssmin()) // This will minify everything, including abogacia.css
        .pipe(gulp.dest('.'))
        .on('end', () => console.log(`Created: ${cssBundles[0].outputFileName}`));
});

// HTML minification
gulp.task('min:html', function () {
    const htmlBundles = getBundles(regex.html);
    if (htmlBundles.length === 0) return Promise.resolve(); // Skip if no HTML bundles

    return gulp.src(htmlBundles[0].inputFiles, { base: '.' })
        .pipe(concat(htmlBundles[0].outputFileName))
        .pipe(htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true }))
        .pipe(gulp.dest('.'))
        .on('end', () => console.log(`Created: ${htmlBundles[0].outputFileName}`));
});

gulp.task('gzip', function () {
    const cssPath = 'wwwroot/css/site.min.css';
    const jsPath = 'wwwroot/js/site.min.js';
    const fontFiles = 'wwwroot/css/fonts/**/*.{woff,woff2}';

    const tasks = [];

    // Check if CSS file exists, then gzip
    if (fileExists(cssPath)) {
        tasks.push(
            gulp.src(cssPath)
                .pipe(gzip({ append: true }))
                .pipe(gulp.dest('wwwroot/css'))
                .on('end', () => console.log(`Gzipped: ${cssPath}`))
        );
    }

    // Check if JS file exists, then gzip
    if (fileExists(jsPath)) {
        tasks.push(
            gulp.src(jsPath)
                .pipe(gzip({ append: true }))
                .pipe(gulp.dest('wwwroot/js'))
                .on('end', () => console.log(`Gzipped: ${jsPath}`))
        );
    }

    // Gzip font files
    tasks.push(
        gulp.src(fontFiles)
            .pipe(gzip({ append: true }))
            .pipe(gulp.dest('wwwroot/css/fonts'))
            .on('end', () => console.log(`Gzipped font files.`))
    );

    return merge(tasks); // Combine tasks
});

// Clean task to delete existing minified files
gulp.task('clean', () => {
    return del(bundleconfig.map(bundle => bundle.outputFileName));
});

// Task to minify and gzip specific plugin JS files
gulp.task('minify-and-gzip-plugins-js', function () {
    return gulp.src(['wwwroot/js/**/plugins.*.js', '!wwwroot/js/**/plugins.*.min.js']) // Match plugins.*.js excluding .min.js
        .pipe(rename({ suffix: '.min' }))  // Rename to *.min.js
        .pipe(terser())                    // Minify the JavaScript files
        .pipe(gulp.dest('wwwroot/js'))     // Save the .min.js files in the same directory
        .pipe(gzip())                      // Create gzipped versions
        .pipe(gulp.dest('wwwroot/js'));    // Save the .min.js.gz files in the same directory
});

// Helper function to get bundle files based on regex pattern
const getBundles = (regexPattern) => {
    const bundles = bundleconfig.filter(bundle => regexPattern.test(bundle.outputFileName));
    console.log("Processing Bundles:", bundles.map(bundle => bundle.outputFileName));
    return bundles;
};

// Define min tasks as series to ensure strict execution order
gulp.task('min', gulp.series('min:js', 'min:css', 'min:html'));

// Font Optimization Task (without Gzip)
gulp.task('font-optimize', async function () {
    const ttf2woff2 = await import('gulp-ttf2woff2'); // Dynamically import gulp-ttf2woff2

    return gulp.src('wwwroot/css/fonts/**/*.{woff,ttf,otf}') // Target fonts in the specified directory
        .pipe(ttf2woff2.default())                            // Convert to WOFF2 format
        .pipe(gulp.dest('wwwroot/css/fonts'))                 // Save WOFF2 files
        .on('end', () => console.log('Fonts optimized.'));
});

// Default task to clean, minify, and gzip files in strict sequence
gulp.task('default', gulp.series('clean', 'min', 'gzip', 'font-optimize'));
