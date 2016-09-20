'use strict';

/**
 * Given a kafkaMessage from Blizzard's node-rdkafka KafkaConsumer,
 * convert message from a utf-8 byte buffer into a JSON string and then
 * into an object.  Augment this object with meta.(topic|partition|offset|key).
 *
 * @param {Object} kafkaMessage
 * @return {Object}
 */
function deserializer(kafkaMessage) {
    let message = JSON.parse(kafkaMessage.message.toString('utf-8'));

    if (!('meta' in message)) {
        message.meta = {};
    }
    message.meta.topic      = kafkaMessage.topic;
    message.meta.partition  = kafkaMessage.partition;
    message.meta.offset     = kafkaMessage.offset;
    message.meta.key        = kafkaMessage.key;

    return message;
}

module.exports = {
    deserializer: deserializer
};
