/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Priority_Sheet_TitleInputs */

const en_ticket_priority_sheet_title = /** @type {(inputs: Ticket_Priority_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change priority`)
};

const es_ticket_priority_sheet_title = /** @type {(inputs: Ticket_Priority_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar prioridad`)
};

const en_xa2_ticket_priority_sheet_title = /** @type {(inputs: Ticket_Priority_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè prìòrìty •••••⟧`)
};

/**
* | output |
* | --- |
* | "Change priority" |
*
* @param {Ticket_Priority_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_priority_sheet_title = /** @type {((inputs?: Ticket_Priority_Sheet_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Priority_Sheet_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_priority_sheet_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_priority_sheet_title(inputs)
	return en_ticket_priority_sheet_title(inputs)
});