var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');


module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env : {
            options : {
                //Shared Options Hash
            },
            prod : {
                // For webpack
                // need to set BABEL_ENV to strip PropTypes
                // but from command line "NODE_ENV=production webpack -p" will strip PropTypes automatically
                BABEL_ENV : 'production'
            }
        },
        webpack: { 
            options: webpackConfig,
            watch: {
                watch: true,
                keepalive: false, // this will block next grunt task
                watchOptions: {
                    poll:1000
                }
            },
            dev: {
            },
            prod: {
                // replicate from webpack config, since node_env cannot be passed onto webpack
                mode: 'production',
                plugins: webpackConfig.plugins.concat(
                    // new webpack.optimize.UglifyJsPlugin({
                    //     compress: {
                    //         screw_ie8: true
                    //     }
                    // }),
                    new webpack.DefinePlugin({
                        'process.env': {
                            NODE_ENV: JSON.stringify("production")
                        }
                    })
                ),
                optimization: {
                    splitChunks: webpackConfig.optimization.splitChunks,
                    minimize: true
                }
            }
        },
        less: {
            options: {
                //cleancss: true
                //compress:true
            },
            files: {
                expand: true,
                //cwd: "../",
                src: ["less/*.less"],
                dest: "build/css-temp",
                ext: ".css"
            }
        },
        concat: {
            css: {
                src: ['build/css-temp/**/*.css'],
                dest: "build/css/app.css"
            }
        },
        watch: {
            locale: {
                files: ['locales/**/*.json'],
                tasks: ['build-locales']
            },
            styles: {
              files: ['less/**/*.less'], // which files to watch
              tasks: ['build-less'],
              options: {
                nospawn: true
              }
            }
        }
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.registerTask('clean-less', function() {
        console.log('removing css-temp folder...');
        fse.removeSync('build/css-temp');
    });
    grunt.registerTask('build-less', function() {
        grunt.task.run('less','concat:css', 'clean-less');
    });
    grunt.registerTask('build-locales', function() {
        console.log('checking locale files...')
        if (fs.existsSync('locales')) {
            console.log('concat locale files...');
            fs.readdirSync('locales').forEach(lng => {
                let res = {};
                fs.readdirSync(`locales/${lng}`).forEach(filepath => {
                    res[path.basename(filepath, '.json')] = fse.readJsonSync(`locales/${lng}/${filepath}`);
                })
                fse.outputJsonSync(`build/locales/${lng}.json`, res);
            });
        }
    });
    grunt.registerTask('clean', function() {
        console.log('cleaning generated build...')
        fse.removeSync('build')
    });
    grunt.registerTask('clean-all', function() {
        grunt.task.run('clean');

        console.log('cleaning dependencies...')
        fse.removeSync('node_modules')
    });
    grunt.registerTask('default', ['webpack:watch', 'build-less', /*'eslint',*/'build-locales', 'watch'])
    grunt.registerTask('dev', ['webpack:dev', 'build-less', /*'eslint',*/'build-locales'])
    grunt.registerTask('prod', ['env:prod','webpack:prod', 'build-less', /*'eslint',*/'build-locales'])
};
