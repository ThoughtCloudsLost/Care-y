/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_ReplyInputs */

const en_demo_topic_reply = /** @type {(inputs: Demo_Topic_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply`)
};

const es_demo_topic_reply = /** @type {(inputs: Demo_Topic_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responder`)
};

const en_xa2_demo_topic_reply = /** @type {(inputs: Demo_Topic_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply ••⟧`)
};

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Demo_Topic_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_reply = /** @type {((inputs?: Demo_Topic_ReplyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_ReplyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_reply(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_reply(inputs)
	return en_demo_topic_reply(inputs)
});