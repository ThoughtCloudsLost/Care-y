/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Save_LabelInputs */

const en_saved_filter_save_label = /** @type {(inputs: Saved_Filter_Save_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save filter`)
};

const es_saved_filter_save_label = /** @type {(inputs: Saved_Filter_Save_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar filtro`)
};

/**
* | output |
* | --- |
* | "Save filter" |
*
* @param {Saved_Filter_Save_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_save_label = /** @type {((inputs?: Saved_Filter_Save_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Save_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_save_label(inputs)
	return es_saved_filter_save_label(inputs)
});