/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Name_LabelInputs */

const en_saved_filter_name_label = /** @type {(inputs: Saved_Filter_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter name`)
};

const es_saved_filter_name_label = /** @type {(inputs: Saved_Filter_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre del filtro`)
};

const en_xa2_saved_filter_name_label = /** @type {(inputs: Saved_Filter_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr nàmè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Filter name" |
*
* @param {Saved_Filter_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_name_label = /** @type {((inputs?: Saved_Filter_Name_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Name_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_name_label(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_name_label(inputs)
	return en_saved_filter_name_label(inputs)
});