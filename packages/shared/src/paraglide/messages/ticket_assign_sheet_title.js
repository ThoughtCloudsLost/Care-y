/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Assign_Sheet_TitleInputs */

const en_ticket_assign_sheet_title = /** @type {(inputs: Ticket_Assign_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign`)
};

const es_ticket_assign_sheet_title = /** @type {(inputs: Ticket_Assign_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar`)
};

/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Ticket_Assign_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_sheet_title = /** @type {((inputs?: Ticket_Assign_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Assign_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_assign_sheet_title(inputs)
	return es_ticket_assign_sheet_title(inputs)
});