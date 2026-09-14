/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Timeline_Email_Received_PlainInputs */

const en_ticket_timeline_email_received_plain = /** @type {(inputs: Ticket_Timeline_Email_Received_PlainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email received`)
};

const es_ticket_timeline_email_received_plain = /** @type {(inputs: Ticket_Timeline_Email_Received_PlainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo recibido`)
};

/**
* | output |
* | --- |
* | "Email received" |
*
* @param {Ticket_Timeline_Email_Received_PlainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_received_plain = /** @type {((inputs?: Ticket_Timeline_Email_Received_PlainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Email_Received_PlainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_email_received_plain(inputs)
	return en_ticket_timeline_email_received_plain(inputs)
});