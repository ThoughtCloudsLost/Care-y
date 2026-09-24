/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_SaveInputs */

const en_saved_filter_save = /** @type {(inputs: Saved_Filter_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_saved_filter_save = /** @type {(inputs: Saved_Filter_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

const en_xa2_saved_filter_save = /** @type {(inputs: Saved_Filter_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Saved_Filter_SaveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_save = /** @type {((inputs?: Saved_Filter_SaveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_SaveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_save(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_save(inputs)
	return en_saved_filter_save(inputs)
});