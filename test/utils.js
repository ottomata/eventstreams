'use strict';


// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

const assert = require('assert');

const utils = require('../lib/utils.js');

describe('deserializer', () => {
    it('should return an augmented message from a Kafka message', () => {
        const kafkaMessage = {
            message: new Buffer('{ "first_name": "Dorkus", "last_name": "Berry" }'),
            topic: 'test',
            partition: 1,
            offset: 123,
            key: 'myKey'
        };

        const msg = utils.deserializer(kafkaMessage);
        assert.equal(msg.meta.topic, kafkaMessage.topic, 'deserialized message should have topic');
        assert.equal(msg.meta.partition, kafkaMessage.partition, 'deserialized message should have partition');
        assert.equal(msg.meta.offset, kafkaMessage.offset, 'deserialized message should have offset');
        assert.equal(msg.meta.key, kafkaMessage.key, 'deserialized message should have key');
    });
});
