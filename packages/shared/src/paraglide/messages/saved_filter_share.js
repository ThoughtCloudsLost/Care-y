/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_ShareInputs */

const en_saved_filter_share = /** @type {(inputs: Saved_Filter_ShareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share`)
};

const es_saved_filter_share = /** @type {(inputs: Saved_Filter_ShareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compartir`)
};

/**
* | output |
* | --- |
* | "Share" |
*
* @param {Saved_Filter_ShareInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_share = /** @type {((inputs?: Saved_Filter_ShareInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ShareInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_share(inputs)
	return es_saved_filter_share(inputs)
});