/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_No_NotesInputs */

const en_ticket_panel_no_notes = /** @type {(inputs: Ticket_Panel_No_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No internal notes yet.`)
};

const es_ticket_panel_no_notes = /** @type {(inputs: Ticket_Panel_No_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin notas internas todavía.`)
};

const en_xa2_ticket_panel_no_notes = /** @type {(inputs: Ticket_Panel_No_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò ìntèrnàl nòtès yèt. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "No internal notes yet." |
*
* @param {Ticket_Panel_No_NotesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_no_notes = /** @type {((inputs?: Ticket_Panel_No_NotesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_No_NotesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_no_notes(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_no_notes(inputs)
	return en_ticket_panel_no_notes(inputs)
});