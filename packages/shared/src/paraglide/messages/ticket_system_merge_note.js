/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Merge_NoteInputs */

const en_ticket_system_merge_note = /** @type {(inputs: Ticket_System_Merge_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets merged`)
};

const es_ticket_system_merge_note = /** @type {(inputs: Ticket_System_Merge_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets fusionados`)
};

/**
* | output |
* | --- |
* | "Tickets merged" |
*
* @param {Ticket_System_Merge_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_merge_note = /** @type {((inputs?: Ticket_System_Merge_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Merge_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_merge_note(inputs)
	return es_ticket_system_merge_note(inputs)
});