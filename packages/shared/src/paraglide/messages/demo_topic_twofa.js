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

const en_xa2_demo_topic_twofa = /** @type {(inputs: Demo_Topic_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò-fàctòr àùth •••••⟧`)
};

/**
* | output |
* | --- |
* | "Two-factor auth" |
*
* @param {Demo_Topic_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_twofa = /** @type {((inputs?: Demo_Topic_TwofaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_TwofaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_twofa(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_twofa(inputs)
	return en_demo_topic_twofa(inputs)
});