/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Switch_To_NoteInputs */

const en_ticket_switch_to_note = /** @type {(inputs: Ticket_Switch_To_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to note mode`)
};

const es_ticket_switch_to_note = /** @type {(inputs: Ticket_Switch_To_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo nota`)
};

/**
* | output |
* | --- |
* | "Switch to note mode" |
*
* @param {Ticket_Switch_To_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_switch_to_note = /** @type {((inputs?: Ticket_Switch_To_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Switch_To_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_switch_to_note(inputs)
	return es_ticket_switch_to_note(inputs)
});