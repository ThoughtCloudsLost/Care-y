/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_DecryptingInputs */

const en_saved_filter_decrypting = /** @type {(inputs: Saved_Filter_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`...`)
};

const es_saved_filter_decrypting = /** @type {(inputs: Saved_Filter_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`...`)
};

const en_xa2_saved_filter_decrypting = /** @type {(inputs: Saved_Filter_DecryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦... •⟧`)
};

/**
* | output |
* | --- |
* | "..." |
*
* @param {Saved_Filter_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_decrypting = /** @type {((inputs?: Saved_Filter_DecryptingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_DecryptingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_decrypting(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_decrypting(inputs)
	return en_saved_filter_decrypting(inputs)
});