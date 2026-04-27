/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_NotesInputs */

const en_ticket_filter_type_notes = /** @type {(inputs: Ticket_Filter_Type_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal Notes`)
};

const es_ticket_filter_type_notes = /** @type {(inputs: Ticket_Filter_Type_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notas internas`)
};

/**
* | output |
* | --- |
* | "Internal Notes" |
*
* @param {Ticket_Filter_Type_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_notes = /** @type {((inputs?: Ticket_Filter_Type_NotesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_NotesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_notes(inputs)
	return es_ticket_filter_type_notes(inputs)
});