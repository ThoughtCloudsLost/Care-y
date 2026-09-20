/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ role: NonNullable<unknown> }} Ticket_Note_Visible_To_RoleInputs */

const en_ticket_note_visible_to_role = /** @type {(inputs: Ticket_Note_Visible_To_RoleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Only visible to ${i?.role} and above`)
};

const es_ticket_note_visible_to_role = /** @type {(inputs: Ticket_Note_Visible_To_RoleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Solo visible para ${i?.role} y superiores`)
};

const en_xa2_ticket_note_visible_to_role = /** @type {(inputs: Ticket_Note_Visible_To_RoleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ònly vìsìblè tò  •••••${i?.role} ànd àbòvè •••⟧`)
};

/**
* | output |
* | --- |
* | "Only visible to {role} and above" |
*
* @param {Ticket_Note_Visible_To_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_visible_to_role = /** @type {((inputs: Ticket_Note_Visible_To_RoleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Visible_To_RoleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_visible_to_role(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_visible_to_role(inputs)
	return en_ticket_note_visible_to_role(inputs)
});