/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Preview_LabelInputs */

const en_saved_filter_preview_label = /** @type {(inputs: Saved_Filter_Preview_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters`)
};

const es_saved_filter_preview_label = /** @type {(inputs: Saved_Filter_Preview_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtros`)
};

/**
* | output |
* | --- |
* | "Filters" |
*
* @param {Saved_Filter_Preview_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_preview_label = /** @type {((inputs?: Saved_Filter_Preview_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Preview_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_preview_label(inputs)
	return es_saved_filter_preview_label(inputs)
});