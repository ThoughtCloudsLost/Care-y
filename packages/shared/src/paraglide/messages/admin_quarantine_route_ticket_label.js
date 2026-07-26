/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Route_Ticket_LabelInputs */

const en_admin_quarantine_route_ticket_label = /** @type {(inputs: Admin_Quarantine_Route_Ticket_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Or route to an existing ticket`)
};

const es_admin_quarantine_route_ticket_label = /** @type {(inputs: Admin_Quarantine_Route_Ticket_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`O enrutar a un ticket existente`)
};

/**
* | output |
* | --- |
* | "Or route to an existing ticket" |
*
* @param {Admin_Quarantine_Route_Ticket_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_ticket_label = /** @type {((inputs?: Admin_Quarantine_Route_Ticket_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_Ticket_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_route_ticket_label(inputs)
	return es_admin_quarantine_route_ticket_label(inputs)
});