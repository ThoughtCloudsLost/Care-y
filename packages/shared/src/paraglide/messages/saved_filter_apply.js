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

const en_xa2_saved_filter_apply = /** @type {(inputs: Saved_Filter_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àpply sàvèd fìltèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Apply saved filter" |
*
* @param {Saved_Filter_ApplyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_apply = /** @type {((inputs?: Saved_Filter_ApplyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_ApplyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_apply(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_apply(inputs)
	return en_saved_filter_apply(inputs)
});