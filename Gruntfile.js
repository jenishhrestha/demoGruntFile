module.exports = function( grunt ) {
	require( 'time-grunt' )( grunt );
	require( 'jit-grunt' )( grunt );

	var jsFiles = [ 'assets/js/vendor/*.js', 'assets/js/app.js', 'assets/js/parts/*.js', 'components/**/*.js' ],
		sassFiles = [ 'assets/css/vendor/*.scss', 'assets/css/theme/*.scss', 'assets/css/style.scss', 'assets/css/parts/*.scss', 'components/**/*.scss', 'assets/css/editor-style.scss' ];

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),

		notify_hooks: {
			options: {
				enabled: true,
				success: true,
				duration: 15,
			},
		},
        
        extends: 'google',
        quotes: [2, 'single'],
        globals: {
            SwaggerEditor: false
        },
        env: {
            browser: true
        },
        rules:{
            "linebreak-style": 0
        },
                
		concat: {
			jsDev: {
				src: jsFiles,
				dest: 'assets/dist/app.min.js',
			},
			jsDist: {
				src: jsFiles,
				dest: 'assets/dist/app.min.js',
			},
			options: {
				footer: '})( window, document, jQuery );',
				process: function( src, filepath ) {
					if ( 'assets/js/app.js' === filepath ) {
						src = "(function( root, document, $ ) {\n\t'use strict';\n" + src;
					}

					return src;
				},
			},
		},

		uglify: {
			dist: {
				src: 'assets/dist/app.min.js',
				dest: 'assets/dist/app.min.js',
				options: {
					drop_console: true,
				},
			},
		},

		sass: {
			dist: {
				files: {
					'assets/cache/postcss/style.min.css': 'assets/css/style.scss',
					'assets/cache/postcss/editor-style.min.css': 'assets/css/editor-style.scss',
				},
				options: {
					outputStyle: 'compressed',
				},
			},
			dev: {
				files: {
					'assets/cache/postcss/style.min.css': 'assets/css/style.scss',
					'assets/cache/postcss/editor-style.min.css': 'assets/css/editor-style.scss',
				},
				options: {
					sourceMap: true,
					outputStyle: 'compressed',
				},
			},
		},

		postcss: {
			dist: {
				files: [{
					expand: true,
					cwd: 'assets/cache/postcss/',
					src: [ '*.css' ],
					dest: 'assets/dist/',
				}],
			},
			dev: {
				files: [{
					expand: true,
					cwd: 'assets/cache/postcss/',
					src: [ '*.css' ],
					dest: 'assets/dist/',
				}],
				options: {
					map: true,
				},
			},
			options: {
				processors: [
					require( 'autoprefixer' )({ browsers: [ 'last 2 versions', 'IE >= 10', 'iOS 8' ] }),
				],
			},
		},

		sass_globbing: {
			dist: {
				files: {
					'assets/cache/import-maps/_vendor.scss': 'assets/css/vendor/*.scss',
					'assets/cache/import-maps/_parts.scss': 'assets/css/parts/*.scss',
					'assets/cache/import-maps/_components.scss': 'components/**/*.scss',
					'assets/cache/import-maps/_dependencies.scss': [ 'assets/css/theme/variables.scss', 'assets/css/theme/mixins.scss', 'assets/css/theme/helpers.scss' ],
				},
				options: {
					useSingleQuotes: false,
					signature: false,
				},
			},
		},

		imagemin: {
			dynamic: {
				options: {
					optimizationLevel: 5, // 0-7 where 3 is default. Higher is heavier.
				},
				files: [ {
					expand: true,
					cwd: 'assets/img/',
					src: [ '**/*.{png,jpg,gif,svg}', '*.{png,jpg,gif,svg}' ],
					dest: 'assets/img/',
				} ],
			},
		},

		clean: {
			cache: 'assets/cache/*',
		},

		copy: {
			fontello: {
				src: 'assets/css/vendor/fontello.scss',
				dest: 'assets/dist/fontello.css',
			},
            fontawesome: {
                src: 'assets/css/vendor/font-awesome.scss',
				dest: 'assets/dist/font-awesome.css',
            },
		},

		stylelint: {
			dev: {
				src: [
					'assets/css/style.scss',
					'assets/css/editor-style.scss',
					'assets/css/theme/*.scss',
					'assets/css/parts/*.scss',
					'components/**/*.scss',
				],
				options: {
					configFile: 'assets/config/.stylelintrc.json',
					failOnError: true,
					syntax: 'scss'
				}
			}
		},

		eslint: {
			dev: {
				src: [
					'assets/js/app.js',
					'assets/js/parts/*.js',
					'components/**/*.js'
				],
				options: {
					configFile: 'assets/config/.eslintrc.json'
				}
			},
		},

		watch: {
			js: {
				files: jsFiles,
				tasks: 'js',
			},
			css: {
				files: sassFiles,
				tasks: 'css',
			},
			fontello: {
				files: [ 'assets/css/vendor/fontello.scss' ],
				tasks: 'copy:fontello',
			},
            fontawesome: {
                files: [ 'assets/css/vendor/font-awesome.scss' ],
				tasks: 'copy:font-awesome',
            },
			livereload: {
				files: [ 'assets/dist/style.min.css', 'assets/dist/app.min.js' ],
				options: {
					livereload: true,
					livereloadOnError: false,
				},
			},
		},
	});

	grunt.loadNpmTasks( 'grunt-notify' );
    
	grunt.task.run( 'notify_hooks' );
    

	grunt.registerTask( 'default', [], function() {
		grunt.task.run( 'watch' );
	});

	grunt.registerTask( 'js', [], function() {
		grunt.task.run(
			'eslint:dev',
			'concat:jsDev'
		);
	});

	grunt.registerTask( 'css', [], function() {
		grunt.task.run(
			'stylelint',
			'sass_globbing:dist',
			'sass:dev',
			'changed:postcss:dev'
		);
	});

	grunt.registerTask( 'img', [], function() {
		grunt.task.run( 'imagemin' );
	});

	grunt.registerTask( 'dist', [], function() {
		grunt.task.run(
			'eslint:dev',
			'stylelint',
			'concat:jsDist',
			'uglify:dist',
			'sass_globbing',
			'sass:dist',
			'changed:postcss:dist',
			'clean:cache'
		);
	});
};
