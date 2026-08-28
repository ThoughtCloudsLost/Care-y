/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Search_LabelInputs */

const en_portal_search_label = /** @type {(inputs: Portal_Search_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search this conversation`)
};

const es_portal_search_label = /** @type {(inputs: Portal_Search_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en esta conversación`)
};

/**
* | output |
* | --- |
* | "Search this conversation" |
*
* @param {Portal_Search_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_search_label = /** @type {((inputs?: Portal_Search_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Search_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_search_label(inputs)
	return es_portal_search_label(inputs)
});