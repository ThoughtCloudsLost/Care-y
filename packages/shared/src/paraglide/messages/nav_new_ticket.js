/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_New_TicketInputs */

const en_nav_new_ticket = /** @type {(inputs: Nav_New_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Ticket`)
};

const es_nav_new_ticket = /** @type {(inputs: Nav_New_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo Ticket`)
};

/**
* | output |
* | --- |
* | "New Ticket" |
*
* @param {Nav_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_new_ticket = /** @type {((inputs?: Nav_New_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_New_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_new_ticket(inputs)
	return es_nav_new_ticket(inputs)
});