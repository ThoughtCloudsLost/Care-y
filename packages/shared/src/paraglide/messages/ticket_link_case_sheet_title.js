/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_Link_Case_Sheet_TitleInputs */

const en_ticket_link_case_sheet_title = /** @type {(inputs: Ticket_Link_Case_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Link a ${i?.ticket}`)
};

const es_ticket_link_case_sheet_title = /** @type {(inputs: Ticket_Link_Case_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Vincular un ${i?.ticket}`)
};

const en_xa2_ticket_link_case_sheet_title = /** @type {(inputs: Ticket_Link_Case_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Lìnk à  •••${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "Link a {ticket}" |
*
* @param {Ticket_Link_Case_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_sheet_title = /** @type {((inputs: Ticket_Link_Case_Sheet_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Link_Case_Sheet_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_link_case_sheet_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_link_case_sheet_title(inputs)
	return en_ticket_link_case_sheet_title(inputs)
});