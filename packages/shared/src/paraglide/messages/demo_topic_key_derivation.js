/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_Key_DerivationInputs */

const en_demo_topic_key_derivation = /** @type {(inputs: Demo_Topic_Key_DerivationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key derivation`)
};

const es_demo_topic_key_derivation = /** @type {(inputs: Demo_Topic_Key_DerivationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Derivacion de claves`)
};

/**
* | output |
* | --- |
* | "Key derivation" |
*
* @param {Demo_Topic_Key_DerivationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_key_derivation = /** @type {((inputs?: Demo_Topic_Key_DerivationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Key_DerivationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_key_derivation(inputs)
	return es_demo_topic_key_derivation(inputs)
});