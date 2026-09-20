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

const en_xa2_admin_terminology_group_ticket = /** @type {(inputs: Admin_Terminology_Group_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wòrk ìtèm •••⟧`)
};

/**
* | output |
* | --- |
* | "Work item" |
*
* @param {Admin_Terminology_Group_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_ticket = /** @type {((inputs?: Admin_Terminology_Group_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_group_ticket(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_group_ticket(inputs)
	return en_admin_terminology_group_ticket(inputs)
});