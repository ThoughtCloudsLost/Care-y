/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_NotesInputs */

const en_ticket_panel_notes = /** @type {(inputs: Ticket_Panel_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notes`)
};

const es_ticket_panel_notes = /** @type {(inputs: Ticket_Panel_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notas`)
};

/**
* | output |
* | --- |
* | "Notes" |
*
* @param {Ticket_Panel_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_notes = /** @type {((inputs?: Ticket_Panel_NotesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_NotesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_notes(inputs)
	return es_ticket_panel_notes(inputs)
});