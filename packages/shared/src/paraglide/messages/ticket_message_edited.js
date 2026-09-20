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

const en_xa2_ticket_message_edited = /** @type {(inputs: Ticket_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦(èdìtèd) •••⟧`)
};

/**
* | output |
* | --- |
* | "(edited)" |
*
* @param {Ticket_Message_EditedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_message_edited = /** @type {((inputs?: Ticket_Message_EditedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Message_EditedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_message_edited(inputs)
	if (locale === "en-XA") return en_xa2_ticket_message_edited(inputs)
	return en_ticket_message_edited(inputs)
});