/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Ticket_Sms_TitleInputs */

const en_ticket_sms_title = /** @type {(inputs: Ticket_Sms_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Text ${i?.Client}`)
};

const es_ticket_sms_title = /** @type {(inputs: Ticket_Sms_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mensaje al ${i?.client}`)
};

const en_xa2_ticket_sms_title = /** @type {(inputs: Ticket_Sms_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Tèxt  ••${i?.Client}⟧`)
};

/**
* | output |
* | --- |
* | "Text {Client}" |
*
* @param {Ticket_Sms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_title = /** @type {((inputs: Ticket_Sms_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_sms_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_sms_title(inputs)
	return en_ticket_sms_title(inputs)
});