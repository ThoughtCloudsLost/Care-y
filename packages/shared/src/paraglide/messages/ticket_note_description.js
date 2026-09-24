/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_DescriptionInputs */

const en_ticket_note_description = /** @type {(inputs: Ticket_Note_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only visible to other members of your organization.`)
};

const es_ticket_note_description = /** @type {(inputs: Ticket_Note_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo visible para otros miembros de tu organización.`)
};

const en_xa2_ticket_note_description = /** @type {(inputs: Ticket_Note_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònly vìsìblè tò òthèr mèmbèrs òf yòùr òrgànìzàtìòn. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Only visible to other members of your organization." |
*
* @param {Ticket_Note_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_description = /** @type {((inputs?: Ticket_Note_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_description(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_description(inputs)
	return en_ticket_note_description(inputs)
});