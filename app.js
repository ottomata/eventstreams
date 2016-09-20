#!/usr/bin/env node
'use strict';

const http          = require('http');
const socketio      = require('socket.io');
const Kasocki       = require('kasocki');
const P             = require('bluebird');


// Our deserializer saves kafka topic, partition, offset, and key
// in .meta subobject.
const deserializer  = require('./lib/utils').deserializer;

const defaultKasockiConfig = {
    port: 6927,
    kafkaConfig: {
        'metadata.broker.list': 'localhost:9092'
    }
};

function createKasockiServer(options) {
    const logger               = options.logger._logger;

    let kasockiConfig          = Object.assign(defaultKasockiConfig, options.config);
    kasockiConfig.logger       = logger;
    kasockiConfig.statsd       = options.metrics;
    kasockiConfig.deserializer = deserializer;

    const server = http.createServer();
    const io = require('socket.io')(server);

    // Bind Kasocki to all sockets connected to this io object.
    // You could alternatively use a socket.io namespace.
    io.on('connection', (socket) => {
        new Kasocki(socket, kasockiConfig).connect();
    });

    logger.info(
        `Listening for socket.io connections on port ${kasockiConfig.port}, ` +
        `consuming from Kafka ${kasockiConfig.kafkaConfig['metadata.broker.list']}`
    );
    server.listen(kasockiConfig.port);
    return server;
}

// If this file is being run directly, just create the server with
// defaults and start listening.
if (require.main === module) {
    // Instantiate a bunyan logger to use if we aren't running via
    // service-runner.
    const bunyan = require('bunyan');
    let logger = bunyan.createLogger({ name: 'event-streams', src: true, level: 'debug' });
    createKasockiServer({
        // service-runner's logger has a bunyan logger as _logger.
        logger: { _logger: logger }
    });
}

module.exports = createKasockiServer;
