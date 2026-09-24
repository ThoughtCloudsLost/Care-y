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

const en_xa2_saved_filter_share = /** @type {(inputs: Saved_Filter_ShareInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè ••⟧`)
};

/**
* | output |
* | --- |
* | "Share" |
*
* @param {Saved_Filter_ShareInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_share = /** @type {((inputs?: Saved_Filter_ShareInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ShareInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_share(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_share(inputs)
	return en_saved_filter_share(inputs)
});