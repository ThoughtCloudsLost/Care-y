/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_View_ListInputs */

const en_tickets_view_list = /** @type {(inputs: Tickets_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`List view`)
};

const es_tickets_view_list = /** @type {(inputs: Tickets_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de lista`)
};

/**
* | output |
* | --- |
* | "List view" |
*
* @param {Tickets_View_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_view_list = /** @type {((inputs?: Tickets_View_ListInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_View_ListInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_view_list(inputs)
	return es_tickets_view_list(inputs)
});