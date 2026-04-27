/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Role_TicketsInputs */

const en_mgr_role_tickets = /** @type {(inputs: Mgr_Role_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elevated ticket management permissions`)
};

const es_mgr_role_tickets = /** @type {(inputs: Mgr_Role_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permisos elevados de gestion de tickets`)
};

/**
* | output |
* | --- |
* | "Elevated ticket management permissions" |
*
* @param {Mgr_Role_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_role_tickets = /** @type {((inputs?: Mgr_Role_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Role_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_role_tickets(inputs)
	return es_mgr_role_tickets(inputs)
});