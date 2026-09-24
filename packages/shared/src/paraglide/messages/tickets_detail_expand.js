/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Detail_ExpandInputs */

const en_tickets_detail_expand = /** @type {(inputs: Tickets_Detail_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open full view`)
};

const es_tickets_detail_expand = /** @type {(inputs: Tickets_Detail_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir vista completa`)
};

const en_xa2_tickets_detail_expand = /** @type {(inputs: Tickets_Detail_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn fùll vìèw •••••⟧`)
};

/**
* | output |
* | --- |
* | "Open full view" |
*
* @param {Tickets_Detail_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_detail_expand = /** @type {((inputs?: Tickets_Detail_ExpandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Detail_ExpandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_detail_expand(inputs)
	if (locale === "en-XA") return en_xa2_tickets_detail_expand(inputs)
	return en_tickets_detail_expand(inputs)
});