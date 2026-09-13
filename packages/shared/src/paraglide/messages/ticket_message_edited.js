/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Message_EditedInputs */

const en_ticket_message_edited = /** @type {(inputs: Ticket_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(edited)`)
};

const es_ticket_message_edited = /** @type {(inputs: Ticket_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(editado)`)
};

/**
* | output |
* | --- |
* | "(edited)" |
*
* @param {Ticket_Message_EditedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_message_edited = /** @type {((inputs?: Ticket_Message_EditedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Message_EditedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_message_edited(inputs)
	return es_ticket_message_edited(inputs)
});