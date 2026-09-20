/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Filter_ClearInputs */

const en_portal_filter_clear = /** @type {(inputs: Portal_Filter_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear filters`)
};

const es_portal_filter_clear = /** @type {(inputs: Portal_Filter_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar filtros`)
};

const en_xa2_portal_filter_clear = /** @type {(inputs: Portal_Filter_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr fìltèrs ••••⟧`)
};

/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Portal_Filter_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_filter_clear = /** @type {((inputs?: Portal_Filter_ClearInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Filter_ClearInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_filter_clear(inputs)
	if (locale === "en-XA") return en_xa2_portal_filter_clear(inputs)
	return en_portal_filter_clear(inputs)
});