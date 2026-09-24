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

const en_xa2_saved_filter_shared_label = /** @type {(inputs: Saved_Filter_Shared_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Shared" |
*
* @param {Saved_Filter_Shared_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_shared_label = /** @type {((inputs?: Saved_Filter_Shared_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Shared_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_shared_label(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_shared_label(inputs)
	return en_saved_filter_shared_label(inputs)
});