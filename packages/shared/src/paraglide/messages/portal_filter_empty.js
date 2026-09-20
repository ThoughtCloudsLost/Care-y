/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Filter_EmptyInputs */

const en_portal_filter_empty = /** @type {(inputs: Portal_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No messages match this filter.`)
};

const es_portal_filter_empty = /** @type {(inputs: Portal_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún mensaje coincide con este filtro.`)
};

const en_xa2_portal_filter_empty = /** @type {(inputs: Portal_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò mèssàgès màtch thìs fìltèr. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No messages match this filter." |
*
* @param {Portal_Filter_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_filter_empty = /** @type {((inputs?: Portal_Filter_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Filter_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_filter_empty(inputs)
	if (locale === "en-XA") return en_xa2_portal_filter_empty(inputs)
	return en_portal_filter_empty(inputs)
});