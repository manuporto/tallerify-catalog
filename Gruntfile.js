module.exports = function(grunt) {
    "use strict";

    require("load-grunt-tasks"); // Loads all grunt tasks

    grunt.initConfig({
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: "./public",
                        src: ["**"],
                        dest: "./dist/public"
                    },
                    {
                        expand: true,
                        cwd: "./views",
                        src: ["**"],
                        dest: "./dist/views"
                    }
                ]
            }
        },
        ts: {
            app: {
                files: [{
                    src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
                    dest: "./dist"
                }],
                options: {
                    module: "commonjs",
                    target: "es6",
                    sourceMap: true
                }
            }
        },
        watch: {
            ts: {
                files: ["src/\*\*/\*.ts"],
                tasks: ["ts"]
            },
            views: {
                files: ["views/**/*.pug"],
                tasks: ["copy"]
            }
        },
        /* Cleans out transpiled files */
        clean: {
            dist: {
                files: [{
                    src: [
                        "./coverage",
                        "./dist"
                    ]
                }]
            }
        },

        /* Generates the coverage JSON and HTML files */
        "mocha_istanbul": {
            coverage: {
                options: {
                    mask: "*.spec.js"
                },
                src: "dist"
            },
            coveralls: {
                src: "dist",
                options: {
                    coverage:true, // this will make the grunt.event.on('coverage') event listener to be triggered
                    reportFormats: ['cobertura','lcovonly']
                }
            }
        },

        /* Rewrites the JSON and HTML coverage files with your actual ES6/TS/CS files */
        remapIstanbul: {
            dist: {
                options: {
                    reports: {
                        "html": "./coverage/lcov-report",
                        "json": "./coverage/coverage.json"
                    }
                },
                src: "./coverage/coverage.json"
            }
        },

        /* Checks the coverage meets the threshold */
        coverage: {
            check: {
                options: {
                    thresholds: {
                        branches: 75,
                        functions: 75,
                        lines: 75,
                        statements: 75
                    },
                    dir: "./coverage"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-istanbul-coverage");
    grunt.loadNpmTasks("grunt-mocha-istanbul");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("remap-istanbul"); // Manually load remap-istanbul

    grunt.registerTask("default", [
        "copy",
        "ts"
    ]);

    grunt.registerTask("codecoverage", "Runs the code coverage tests", [
        "clean",
        "copy",
        "ts",
        "mocha_istanbul:coverage",
        "remapIstanbul:dist",
        "coverage:check"
    ]);

    grunt.registerTask("coveralls", "Runs the code coverage tests", [
        "clean",
        "copy",
        "ts",
        "mocha_istanbul:coveralls",
        "remapIstanbul:dist",
        "coverage:check"
    ]);

    grunt.event.on('coverage', function(lcov, done){
        require('coveralls').handleInput(lcov, function(err){
            if (err) {
                return done(err);
            }
            done();
        });
    });
};