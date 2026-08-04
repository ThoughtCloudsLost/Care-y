/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown>, ticket: NonNullable<unknown> }} Ticket_Content_SavedInputs */

const en_ticket_content_saved = /** @type {(inputs: Ticket_Content_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} content saved`)
};

const es_ticket_content_saved = /** @type {(inputs: Ticket_Content_SavedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Contenido de ${i?.ticket} guardado`)
};

/**
* | output |
* | --- |
* | "{Ticket} content saved" |
*
* @param {Ticket_Content_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_content_saved = /** @type {((inputs: Ticket_Content_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Content_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_content_saved(inputs)
	return es_ticket_content_saved(inputs)
});