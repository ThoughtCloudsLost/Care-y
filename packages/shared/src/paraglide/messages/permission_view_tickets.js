/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_TicketsInputs */

const en_permission_view_tickets = /** @type {(inputs: Permission_View_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View cases`)
};

const es_permission_view_tickets = /** @type {(inputs: Permission_View_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver casos`)
};

/**
* | output |
* | --- |
* | "View cases" |
*
* @param {Permission_View_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_tickets = /** @type {((inputs?: Permission_View_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_tickets(inputs)
	return es_permission_view_tickets(inputs)
});