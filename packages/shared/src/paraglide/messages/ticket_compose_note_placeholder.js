/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Note_PlaceholderInputs */

const en_ticket_compose_note_placeholder = /** @type {(inputs: Ticket_Compose_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal team note...`)
};

const es_ticket_compose_note_placeholder = /** @type {(inputs: Ticket_Compose_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota interna del equipo...`)
};

const en_xa2_ticket_compose_note_placeholder = /** @type {(inputs: Ticket_Compose_Note_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl tèàm nòtè... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal team note..." |
*
* @param {Ticket_Compose_Note_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_note_placeholder = /** @type {((inputs?: Ticket_Compose_Note_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Note_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_compose_note_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_compose_note_placeholder(inputs)
	return en_ticket_compose_note_placeholder(inputs)
});