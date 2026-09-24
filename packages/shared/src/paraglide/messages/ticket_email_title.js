/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Email_TitleInputs */

const en_ticket_email_title = /** @type {(inputs: Ticket_Email_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Email ${i?.client}`)
};

const es_ticket_email_title = /** @type {(inputs: Ticket_Email_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Correo al ${i?.client}`)
};

const en_xa2_ticket_email_title = /** @type {(inputs: Ticket_Email_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl  ••${i?.client}⟧`)
};

/**
* | output |
* | --- |
* | "Email {client}" |
*
* @param {Ticket_Email_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_title = /** @type {((inputs: Ticket_Email_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_title(inputs)
	return en_ticket_email_title(inputs)
});