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

/**
* | output |
* | --- |
* | "Unshare" |
*
* @param {Saved_Filter_UnshareInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_unshare = /** @type {((inputs?: Saved_Filter_UnshareInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_UnshareInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_unshare(inputs)
	return es_saved_filter_unshare(inputs)
});