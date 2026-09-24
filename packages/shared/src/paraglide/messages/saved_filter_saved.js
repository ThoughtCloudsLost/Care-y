/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_SavedInputs */

const en_saved_filter_saved = /** @type {(inputs: Saved_Filter_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter saved`)
};

const es_saved_filter_saved = /** @type {(inputs: Saved_Filter_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtro guardado`)
};

const en_xa2_saved_filter_saved = /** @type {(inputs: Saved_Filter_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr sàvèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Filter saved" |
*
* @param {Saved_Filter_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_saved = /** @type {((inputs?: Saved_Filter_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_saved(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_saved(inputs)
	return en_saved_filter_saved(inputs)
});