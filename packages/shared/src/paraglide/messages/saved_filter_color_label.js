/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Color_LabelInputs */

const en_saved_filter_color_label = /** @type {(inputs: Saved_Filter_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color`)
};

const es_saved_filter_color_label = /** @type {(inputs: Saved_Filter_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color`)
};

/**
* | output |
* | --- |
* | "Color" |
*
* @param {Saved_Filter_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_color_label = /** @type {((inputs?: Saved_Filter_Color_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Color_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_color_label(inputs)
	return es_saved_filter_color_label(inputs)
});