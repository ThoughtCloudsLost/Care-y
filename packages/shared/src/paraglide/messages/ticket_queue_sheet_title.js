/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Queue_Sheet_TitleInputs */

const en_ticket_queue_sheet_title = /** @type {(inputs: Ticket_Queue_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change queue`)
};

const es_ticket_queue_sheet_title = /** @type {(inputs: Ticket_Queue_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar cola`)
};

/**
* | output |
* | --- |
* | "Change queue" |
*
* @param {Ticket_Queue_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_queue_sheet_title = /** @type {((inputs?: Ticket_Queue_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Queue_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_queue_sheet_title(inputs)
	return en_ticket_queue_sheet_title(inputs)
});