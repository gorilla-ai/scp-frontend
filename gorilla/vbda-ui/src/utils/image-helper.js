import Progress from "react-ui/build/src/components/progress";
import Promise from "bluebird";


export default function imageConverter(source) {
    Progress.startSpin()
    const converter = typeof source === 'string' ? urlToBase64Jpeg : fileToBase64
    return new Promise((resolve, reject) =>
        converter(source, resolve))
        .then((base64String) => {
            Progress.done()
            return base64String
        })
}

function fileToBase64(file, resolve) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // callBack(reader.result)
        const base64Value = reader.result
        resolve(base64Value)
    };
}
/**
 * ref from Jerry base64-helper
 */
function urlToBase64Jpeg(url, resolve) {
    let timedOut = false, timer;
    let image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = () => {
        if (!timedOut) {
            clearTimeout(timer);
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            context.drawImage(image, 0, 0);

            let dataUrl = canvas.toDataURL('image/jpeg', 1);
            resolve(dataUrl);

            canvas = null;
        }
    };

    image.onerror = image.onabort = () => {
        if (!timedOut) {
            clearTimeout(timer);
            alert('load image fail')
            resolve(null);
        }
    };

    timer = setTimeout(function () {
        timedOut = true;
        alert('load image time out')
        resolve(null);
    }, 5000);

    image.src = url;
}

export function removeBase64Format(base64) {
    return base64.slice(base64.indexOf(",") + 1)
}

export function findUrlFromFileServiceFormat(event, fieldName) {
    let fieldNameOfUUID = ''
    if (fieldName.indexOf('.') > 0) {
        var pos = fieldName.lastIndexOf('.');//找出最後一個.並取代成.__
        fieldNameOfUUID = fieldName.substring(0, pos) + '.__' + fieldName.substring(pos + 1);
    }
    else {
        fieldNameOfUUID = '__' + fieldName
    }
    let uuid = _.get(event, fieldNameOfUUID)
    if (_.isArray(uuid)) {
        return _.map(uuid, uuid => {
            return findUrlByUUID(uuid, event)
        })
    }
    else {
        return [findUrlByUUID(uuid, event)]//字串仍然回傳單筆url
    }
}

export function findrReferencePathForFileServiceToDelete(event, fieldName, targetUUID) {
    let fieldNameOfUUID = ''
    if (fieldName.indexOf('.') > 0) {
        var pos = fieldName.lastIndexOf('.');//找出最後一個.並取代成.__
        fieldNameOfUUID = fieldName.substring(0, pos) + '.__' + fieldName.substring(pos + 1);
    }
    else {
        fieldNameOfUUID = '__' + fieldName
    }
    let uuid = _.get(event, fieldNameOfUUID)
    if (_.isArray(uuid)) {
        const index = _.findIndex(uuid, function (o) {
            return o === targetUUID;
        })
        return fieldName + '.' + index
    }
    else {
        return fieldName
    }
}

function findUrlByUUID(uuid, event) {
    const fileInfoIndex = _.findIndex(event['__fileInfo'], function (o) {
        return o.uuid === uuid;
    })
    if (fileInfoIndex !== -1)
        return _.get(event, ['__fileInfo', fileInfoIndex, 'fileServerPath'])
    return null
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'bmp']

export function isURLImage(url) {
    const fileNameExtension = url.slice(url.lastIndexOf('.') + 1)
    let isImage = false
    _.forEach(IMAGE_EXTENSIONS, (IMAGE_EXTENSION) => {
        if (fileNameExtension.toLowerCase() === IMAGE_EXTENSION) {
            isImage = true
            return false
        }
    })
    return isImage
}

export function isBase64Image(base64) {
    return getBase64Extention(base64) !== undefined
}

export function getBase64Extention(base64) {// Create Base64 Object
    var decoded = base64Decode(base64);
    // console.log(decoded);

// if the file extension is unknown
    var extension = undefined;
// do something like this
    var lowerCase = decoded.toLowerCase();
    _.forEach(IMAGE_EXTENSIONS, (IMAGE_EXTENSION) => {
        if (lowerCase.indexOf(IMAGE_EXTENSION) !== -1) {
            extension = IMAGE_EXTENSION
            return false
        }
    })
    return extension
}

function base64Decode(base64) {
    var Buffer = require('buffer').Buffer;
    return new Buffer(base64, 'base64').toString();
}

export function downloadDataUrl(dataUrl) {
    let fileName = dataUrl.slice(dataUrl.lastIndexOf('/'))

    // Anchor
    var anchor = document.createElement('a');
    anchor.setAttribute('href', dataUrl);
    anchor.setAttribute('download', fileName);

    // Click event
    var event = document.createEvent('MouseEvent');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    anchor.dispatchEvent(event);
    // document.removeChild(anchor)
    // delete anchor;
}