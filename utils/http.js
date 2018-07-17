const http = require('http');
const https = require('https');
const querystring = require('querystring');

// 发送HTTP请求获取数据方法
const doHttp_withdata = (http_options, data) => {
    let message = new Promise(function(resolve, reject) {
        let postData = JSON.stringify(data);
        http_options.headers = {
            "Content-Type": 'application/json, charset=UTF-8',
            "Content-Length": new Buffer(postData).length
        };
        let req = http.request(http_options, function(res) {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write(postData + "\n");
        req.end();
    }).then(function (data) {
        return data;
    });

    return message;
};

// 发送HTTP请求获取数据方法
const doHttp = http_options => {
    let message = new Promise(function(resolve, reject) {
        let req = http.request(http_options, function(res) {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.end();
    }).then(function (data) {
        return data;
    });

    return message;
};

// 发送HTTPS请求获取数据方法
const doHttps_withdata = (https_options, data) => {
    let message = new Promise(function(resolve, reject) {
        let postData = JSON.stringify(data);
        https_options.headers = {
            "Content-Type": 'application/json, charset=UTF-8',
            "Content-Length": new Buffer(postData).length
        };
        let req = https.request(https_options, function(res) {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write(postData + "\n");
        req.end();
    }).then(function (data) {
        return data;
    });

    return message;
};

// 发送HTTPS请求获取数据方法
const doHttps = https_options => {
    let message = new Promise(function(resolve, reject) {
        let req = https.request(https_options, function(res) {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.end();
    }).then(function (data) {
        return data;
    });

    return message;
};

module.exports = {
    doHttp_withdata,
    doHttp,
    doHttps,
    doHttps_withdata
};