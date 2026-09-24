/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Toast_UnheldInputs */

const en_ticket_toast_unheld = /** @type {(inputs: Ticket_Toast_UnheldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} removed from hold`)
};

const es_ticket_toast_unheld = /** @type {(inputs: Ticket_Toast_UnheldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} quitado de espera`)
};

const en_xa2_ticket_toast_unheld = /** @type {(inputs: Ticket_Toast_UnheldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} rèmòvèd fròm hòld ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} removed from hold" |
*
* @param {Ticket_Toast_UnheldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unheld = /** @type {((inputs: Ticket_Toast_UnheldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_UnheldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_unheld(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_unheld(inputs)
	return en_ticket_toast_unheld(inputs)
});