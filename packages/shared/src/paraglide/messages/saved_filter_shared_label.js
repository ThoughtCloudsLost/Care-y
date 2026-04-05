/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Shared_LabelInputs */

const en_saved_filter_shared_label = /** @type {(inputs: Saved_Filter_Shared_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared`)
};

const es_saved_filter_shared_label = /** @type {(inputs: Saved_Filter_Shared_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compartido`)
};

/**
* | output |
* | --- |
* | "Shared" |
*
* @param {Saved_Filter_Shared_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_shared_label = /** @type {((inputs?: Saved_Filter_Shared_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Shared_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_shared_label(inputs)
	return es_saved_filter_shared_label(inputs)
});