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

const en_xa2_saved_filter_color_label = /** @type {(inputs: Saved_Filter_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còlòr ••⟧`)
};

/**
* | output |
* | --- |
* | "Color" |
*
* @param {Saved_Filter_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_color_label = /** @type {((inputs?: Saved_Filter_Color_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Color_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_color_label(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_color_label(inputs)
	return en_saved_filter_color_label(inputs)
});