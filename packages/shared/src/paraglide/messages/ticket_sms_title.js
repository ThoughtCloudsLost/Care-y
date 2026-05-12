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

/**
* | output |
* | --- |
* | "Text {Client}" |
*
* @param {Ticket_Sms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_title = /** @type {((inputs: Ticket_Sms_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sms_title(inputs)
	return es_ticket_sms_title(inputs)
});