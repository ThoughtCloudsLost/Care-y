/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_EmptyInputs */

const en_saved_filter_empty = /** @type {(inputs: Saved_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No saved filters`)
};

const es_saved_filter_empty = /** @type {(inputs: Saved_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin filtros guardados`)
};

const en_xa2_saved_filter_empty = /** @type {(inputs: Saved_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò sàvèd fìltèrs •••••⟧`)
};

/**
* | output |
* | --- |
* | "No saved filters" |
*
* @param {Saved_Filter_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_empty = /** @type {((inputs?: Saved_Filter_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_empty(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_empty(inputs)
	return en_saved_filter_empty(inputs)
});