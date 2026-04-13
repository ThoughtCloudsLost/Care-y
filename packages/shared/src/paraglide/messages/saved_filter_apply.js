/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_ApplyInputs */

const en_saved_filter_apply = /** @type {(inputs: Saved_Filter_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apply saved filter`)
};

const es_saved_filter_apply = /** @type {(inputs: Saved_Filter_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicar filtro guardado`)
};

/**
* | output |
* | --- |
* | "Apply saved filter" |
*
* @param {Saved_Filter_ApplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_apply = /** @type {((inputs?: Saved_Filter_ApplyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ApplyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_apply(inputs)
	return es_saved_filter_apply(inputs)
});