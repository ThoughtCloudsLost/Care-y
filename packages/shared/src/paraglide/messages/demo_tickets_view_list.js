/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_View_ListInputs */

const en_demo_tickets_view_list = /** @type {(inputs: Demo_Tickets_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching to list view`)
};

const es_demo_tickets_view_list = /** @type {(inputs: Demo_Tickets_View_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiando a vista de lista`)
};

/**
* | output |
* | --- |
* | "Switching to list view" |
*
* @param {Demo_Tickets_View_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_list = /** @type {((inputs?: Demo_Tickets_View_ListInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_View_ListInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tickets_view_list(inputs)
	return es_demo_tickets_view_list(inputs)
});