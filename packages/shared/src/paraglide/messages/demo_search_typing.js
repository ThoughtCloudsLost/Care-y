/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_TypingInputs */

const en_demo_search_typing = /** @type {(inputs: Demo_Search_TypingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching encrypted tickets`)
};

const es_demo_search_typing = /** @type {(inputs: Demo_Search_TypingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscando tickets cifrados`)
};

const en_xa2_demo_search_typing = /** @type {(inputs: Demo_Search_TypingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchìng èncryptèd tìckèts •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Searching encrypted tickets" |
*
* @param {Demo_Search_TypingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_typing = /** @type {((inputs?: Demo_Search_TypingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_TypingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_search_typing(inputs)
	if (locale === "en-XA") return en_xa2_demo_search_typing(inputs)
	return en_demo_search_typing(inputs)
});