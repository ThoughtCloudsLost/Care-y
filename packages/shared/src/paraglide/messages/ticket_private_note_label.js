/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Private_Note_LabelInputs */

const en_ticket_private_note_label = /** @type {(inputs: Ticket_Private_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only your team can see this`)
};

const es_ticket_private_note_label = /** @type {(inputs: Ticket_Private_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo tu equipo puede ver esto`)
};

const en_xa2_ticket_private_note_label = /** @type {(inputs: Ticket_Private_Note_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònly yòùr tèàm càn sèè thìs •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Only your team can see this" |
*
* @param {Ticket_Private_Note_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_label = /** @type {((inputs?: Ticket_Private_Note_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Private_Note_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_private_note_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_private_note_label(inputs)
	return en_ticket_private_note_label(inputs)
});