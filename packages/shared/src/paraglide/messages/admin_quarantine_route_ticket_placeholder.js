/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_Ticket_PlaceholderInputs */

const en_admin_quarantine_route_ticket_placeholder = /** @type {(inputs: Admin_Quarantine_Route_Ticket_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket ID`)
};

const es_admin_quarantine_route_ticket_placeholder = /** @type {(inputs: Admin_Quarantine_Route_Ticket_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID del ticket`)
};

/**
* | output |
* | --- |
* | "Ticket ID" |
*
* @param {Admin_Quarantine_Route_Ticket_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_ticket_placeholder = /** @type {((inputs?: Admin_Quarantine_Route_Ticket_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_Ticket_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_ticket_placeholder(inputs)
	return es_admin_quarantine_route_ticket_placeholder(inputs)
});