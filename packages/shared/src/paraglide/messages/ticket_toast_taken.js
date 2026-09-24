/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Toast_TakenInputs */

const en_ticket_toast_taken = /** @type {(inputs: Ticket_Toast_TakenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} assigned to you`)
};

const es_ticket_toast_taken = /** @type {(inputs: Ticket_Toast_TakenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} asignado a ti`)
};

const en_xa2_ticket_toast_taken = /** @type {(inputs: Ticket_Toast_TakenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} àssìgnèd tò yòù •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} assigned to you" |
*
* @param {Ticket_Toast_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_taken = /** @type {((inputs: Ticket_Toast_TakenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_TakenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_taken(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_taken(inputs)
	return en_ticket_toast_taken(inputs)
});