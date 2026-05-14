/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_TicketInputs */

const en_admin_terminology_group_ticket = /** @type {(inputs: Admin_Terminology_Group_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Work item`)
};

const es_admin_terminology_group_ticket = /** @type {(inputs: Admin_Terminology_Group_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elemento de trabajo`)
};

/**
* | output |
* | --- |
* | "Work item" |
*
* @param {Admin_Terminology_Group_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_ticket = /** @type {((inputs?: Admin_Terminology_Group_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_group_ticket(inputs)
	return es_admin_terminology_group_ticket(inputs)
});