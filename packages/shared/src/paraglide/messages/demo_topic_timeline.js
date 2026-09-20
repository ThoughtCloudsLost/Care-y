/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_TimelineInputs */

const en_demo_topic_timeline = /** @type {(inputs: Demo_Topic_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Timeline`)
};

const es_demo_topic_timeline = /** @type {(inputs: Demo_Topic_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Línea de tiempo`)
};

const en_xa2_demo_topic_timeline = /** @type {(inputs: Demo_Topic_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìmèlìnè •••⟧`)
};

/**
* | output |
* | --- |
* | "Timeline" |
*
* @param {Demo_Topic_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_timeline = /** @type {((inputs?: Demo_Topic_TimelineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_TimelineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_timeline(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_timeline(inputs)
	return en_demo_topic_timeline(inputs)
});