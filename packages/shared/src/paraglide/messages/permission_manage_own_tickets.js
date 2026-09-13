/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Own_TicketsInputs */

const en_permission_manage_own_tickets = /** @type {(inputs: Permission_Manage_Own_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Work on own cases`)
};

const es_permission_manage_own_tickets = /** @type {(inputs: Permission_Manage_Own_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Trabajar en casos propios`)
};

/**
* | output |
* | --- |
* | "Work on own cases" |
*
* @param {Permission_Manage_Own_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_own_tickets = /** @type {((inputs?: Permission_Manage_Own_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Own_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_own_tickets(inputs)
	return es_permission_manage_own_tickets(inputs)
});