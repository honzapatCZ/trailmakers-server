var crypto = require("crypto");
function randomStringAsBase64Url(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString("hex").slice(0,length).toString("base64");
}

module.exports = {
    randomStringAsBase64Url
}