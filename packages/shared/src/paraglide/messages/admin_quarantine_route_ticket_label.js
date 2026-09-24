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

const en_xa2_admin_quarantine_route_ticket_label = /** @type {(inputs: Admin_Quarantine_Route_Ticket_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òr ròùtè tò àn èxìstìng tìckèt •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Or route to an existing ticket" |
*
* @param {Admin_Quarantine_Route_Ticket_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_route_ticket_label = /** @type {((inputs?: Admin_Quarantine_Route_Ticket_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Route_Ticket_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_route_ticket_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_route_ticket_label(inputs)
	return en_admin_quarantine_route_ticket_label(inputs)
});