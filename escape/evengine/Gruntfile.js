module.exports = function (grunt) {
    "use strict";

// Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
//         jsdoc: {
//             dist: {
//                 src: ['src/*.js', 'docs/Readme.md'], //, 'components/*.js'],
//                 options: {
//                     /*verbose: true,
//                     access: 'all',
//                     private: true,*/
//                     destination:  'docs/engine',
//                     template: 'docs/arcs',
//                     configure: 'docs/jsdoc.conf.json'
// 
//                 }
//             },
//             components : {
//                 src: ['components/*.js', 'deps/surf/surf.js', 'deps/pose/posit_gen.js'],
//                 options: { 
//                     verbose: true,
//                     destination: 'docs/components',
//                     template: 'docs/arcs',
//                     configure: 'docs/jsdoc.conf.json'
//                 }
//             }                
//         },
//         jslint: {
//             dist: {
//                 src: ['*.js'],
//                 exclude: ['require.js', 'text.js'],
//                 directives: {
//                     node: true,
//                     sloppy: true,
//                     plusplus: true,
//                     forin: true,
//                     devel: true,
//                     white: true,
//                     predef: ['define', 'arcs_module', 'document']
//                     //browser: true,                    
//                 }
//             }
//         },
//         uglify: {
//             build: {
//                 options: {*/
//                     //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//                 },            
//                 files: { 
//                     'build/arcs.min.js': [
//                         'build/arcs.js'
//                     ],
//                     'build/arcs_browser.js': [
//                         'src/arcs_browser.js'
//                     ],
//                     'build/arcseditor.min.js': [
//                         'build/arcseditor.js'
//                     ]
//                 }
//             }
//         },
//         bower: {
//             options : {
//                 verbose: true,
//                 targetDir: './deps',
//                 layout: 'byComponent'
//             },
//             install : {
//                 
//             }
//             
//         },
        concat: {
            dist: {
                src: [
                    'src/fileloader.js',
                    'src/level.js',
                    'src/rendermanager.js',
                    'src/main.js'
                ],
                dest: 'game/js/evengine.js'
            }
        }
    

    });

// Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-bower-task');


// Default task(s).
    grunt.registerTask('default', ['concat']);
    /*grunt.registerTask('lint', ['jslint']);
    grunt.registerTask('doc', ['jsdoc']);*/
};
