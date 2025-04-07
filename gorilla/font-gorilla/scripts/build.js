var webfontsGenerator = require('webfonts-generator')
var fs = require('fs')
var _ = require('lodash')
var SVG_DIR = 'svg'
var FONT_NAME = 'font-gorilla'
var PREVIEW_PATH = 'preview.html'

console.log('Reading svg icons...')
var files = fs.readdirSync(SVG_DIR)

var i
for (i=0; i<files.length; i++) {
    files[i] = SVG_DIR+'/'+files[i]
}

var names = []

console.log('Generating font for '+files.length+' icons...')
webfontsGenerator({
    files: files,
    dest: 'fonts/',
    fontName: FONT_NAME,
    css: true,
    cssDest: 'css/'+FONT_NAME+'.css',
    cssFontsUrl: '../fonts/',
    templateOptions: {
        classPrefix: 'fg-',
        baseSelector: '.fg'
    },
    fontHeight:1000, // must use this otherwise font will look weird
    rename: function(original) {
        var originalName = original.replace(/.svg$/i, '').substring(4)
        var newName = originalName.replace(/^ic_/g,'').replace(/[_ ]/g, '-')

        // if name already exists, try to append index to the end until available name is found, eg. xxx-1, xxx-2...
        var renameBaseCount = 2
        while (names.indexOf(newName) >= 0) {
            console.log(newName+' already exists')
            newName += ('-'+renameBaseCount)
            renameBaseCount++
        }

        names.push(newName)
        console.log('Rename from '+originalName+' to '+newName)
        return newName
    },
    html: true,
    htmlDest: 'preview.html'
}, function(err) {
    if (err) {
        console.error('Fail!', err)
    }
    else {
        console.log('Font generated!')

        console.log('Reading preview file...')

        var previewContent = fs.readFileSync(PREVIEW_PATH)

        console.log('Updating font paths...')
        previewContent = _.replace(previewContent, /\.\.\/fonts/g, "./fonts")


        console.log('Renaming preview class names...')
        previewContent = _.replace(previewContent, /class=" fg-/g, 'class="fg fg-')

        console.log('Adding custom styles to preview...')
        previewContent = _.replace(previewContent, /<\/style>/, '.fg { line-height: unset; } .preview { line-height: 1.7em; width:180px; display:inline-block; } </style>')


        fs.writeFileSync(PREVIEW_PATH, previewContent)
        console.log('Done!')

    }
})