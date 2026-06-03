/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_TicketInputs */

const en_admin_terminology_desc_ticket = /** @type {(inputs: Admin_Terminology_Desc_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An individual case, call, or interaction tracked in the system.`)
};

const es_admin_terminology_desc_ticket = /** @type {(inputs: Admin_Terminology_Desc_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un caso, llamada o interacción individual registrada en el sistema.`)
};

/**
* | output |
* | --- |
* | "An individual case, call, or interaction tracked in the system." |
*
* @param {Admin_Terminology_Desc_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_ticket = /** @type {((inputs?: Admin_Terminology_Desc_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_ticket(inputs)
	return es_admin_terminology_desc_ticket(inputs)
});