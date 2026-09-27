/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Summary_NoneInputs */

const en_saved_filter_summary_none = /** @type {(inputs: Saved_Filter_Summary_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No filters`)
};

const es_saved_filter_summary_none = /** @type {(inputs: Saved_Filter_Summary_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin filtros`)
};

const en_xa2_saved_filter_summary_none = /** @type {(inputs: Saved_Filter_Summary_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò fìltèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "No filters" |
*
* @param {Saved_Filter_Summary_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_summary_none = /** @type {((inputs?: Saved_Filter_Summary_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Summary_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_summary_none(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_summary_none(inputs)
	return en_saved_filter_summary_none(inputs)
});