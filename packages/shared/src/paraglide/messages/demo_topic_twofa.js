/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_TwofaInputs */

const en_demo_topic_twofa = /** @type {(inputs: Demo_Topic_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor auth`)
};

const es_demo_topic_twofa = /** @type {(inputs: Demo_Topic_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

/**
* | output |
* | --- |
* | "Two-factor auth" |
*
* @param {Demo_Topic_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_twofa = /** @type {((inputs?: Demo_Topic_TwofaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_TwofaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_twofa(inputs)
	return es_demo_topic_twofa(inputs)
});