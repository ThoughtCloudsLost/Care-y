/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Role_TicketsInputs */

const en_mgr_role_tickets = /** @type {(inputs: Mgr_Role_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elevated ticket management permissions`)
};

const es_mgr_role_tickets = /** @type {(inputs: Mgr_Role_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permisos elevados de gestión de tickets`)
};

const en_xa2_mgr_role_tickets = /** @type {(inputs: Mgr_Role_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èlèvàtèd tìckèt mànàgèmènt pèrmìssìòns ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Elevated ticket management permissions" |
*
* @param {Mgr_Role_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_role_tickets = /** @type {((inputs?: Mgr_Role_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Role_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_role_tickets(inputs)
	if (locale === "en-XA") return en_xa2_mgr_role_tickets(inputs)
	return en_mgr_role_tickets(inputs)
});