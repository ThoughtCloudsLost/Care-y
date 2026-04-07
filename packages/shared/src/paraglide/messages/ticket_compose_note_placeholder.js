/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Note_PlaceholderInputs */

const en_ticket_compose_note_placeholder = /** @type {(inputs: Ticket_Compose_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type a note...`)
};

const es_ticket_compose_note_placeholder = /** @type {(inputs: Ticket_Compose_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe una nota...`)
};

/**
* | output |
* | --- |
* | "Type a note..." |
*
* @param {Ticket_Compose_Note_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_note_placeholder = /** @type {((inputs?: Ticket_Compose_Note_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Note_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_compose_note_placeholder(inputs)
	return es_ticket_compose_note_placeholder(inputs)
});