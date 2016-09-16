#!/usr/bin/env node
'use strict';

const http      = require('http');
const socketio  = require('socket.io');
const Kasocki   = require('kasocki');
const P         = require('bluebird');


const defaultPort       = 6927;
const defaultBrokers    = 'localhost:9092';

function createKasockiServer(options) {
    // console.log(options);
    const defaultConfig = {
        port: defaultPort,
        kafkaConfig: {
            'metadata.broker.list': defaultBrokers
        }
    };
    let kasockiConfig = Object.assign(defaultConfig, options.config);
    let logger = options.logger._logger;
    kasockiConfig.logger = logger;

    let server = http.createServer();
    let io = require('socket.io')(server);

    io.on('connection', (socket) => {
        // Bind Kasocki to this io instance.
        // You could alternatively pass a socket.io namespace.
        // Kafka broker should be running at localhost:9092
        new Kasocki(socket, kasockiConfig).connect();
    });

    logger.info(
        `Listening for socket.io connections on ${kasockiConfig.port}, ` +
        `consuming from Kafka ${kasockiConfig.kafkaConfig['metadata.broker.list']}`
    );
    server.listen(kasockiConfig.port);
    return server;
}

if (require.main === module) {
    // Instantiate a bunyan logger to use if we aren't running via service-runner.
    const bunyan = require('bunyan');
    let logger = bunyan.createLogger({ name: 'event-streams', src: true, level: 'debug' });
    createKasockiServer({
        logger: { _logger: logger }
    });
}

module.exports = createKasockiServer;
