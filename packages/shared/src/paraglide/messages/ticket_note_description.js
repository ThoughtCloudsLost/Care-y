/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_DescriptionInputs */

const en_ticket_note_description = /** @type {(inputs: Ticket_Note_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only visible to other members of your organization.`)
};

const es_ticket_note_description = /** @type {(inputs: Ticket_Note_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo visible para otros miembros de tu organizacion.`)
};

/**
* | output |
* | --- |
* | "Only visible to other members of your organization." |
*
* @param {Ticket_Note_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_description = /** @type {((inputs?: Ticket_Note_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_description(inputs)
	return es_ticket_note_description(inputs)
});