/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_UnshareInputs */

const en_saved_filter_unshare = /** @type {(inputs: Saved_Filter_UnshareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unshare`)
};

const es_saved_filter_unshare = /** @type {(inputs: Saved_Filter_UnshareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dejar de compartir`)
};

const en_xa2_saved_filter_unshare = /** @type {(inputs: Saved_Filter_UnshareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnshàrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Unshare" |
*
* @param {Saved_Filter_UnshareInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_unshare = /** @type {((inputs?: Saved_Filter_UnshareInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_UnshareInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_unshare(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_unshare(inputs)
	return en_saved_filter_unshare(inputs)
});