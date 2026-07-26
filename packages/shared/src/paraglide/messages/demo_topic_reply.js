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

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Demo_Topic_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_reply = /** @type {((inputs?: Demo_Topic_ReplyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_ReplyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_reply(inputs)
	return es_demo_topic_reply(inputs)
});