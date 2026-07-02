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

/**
* | output |
* | --- |
* | "Open full view" |
*
* @param {Tickets_Detail_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_detail_expand = /** @type {((inputs?: Tickets_Detail_ExpandInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Detail_ExpandInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_detail_expand(inputs)
	return es_tickets_detail_expand(inputs)
});