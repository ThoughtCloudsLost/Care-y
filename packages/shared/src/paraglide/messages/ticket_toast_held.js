/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Toast_HeldInputs */

const en_ticket_toast_held = /** @type {(inputs: Ticket_Toast_HeldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} placed on hold`)
};

const es_ticket_toast_held = /** @type {(inputs: Ticket_Toast_HeldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} puesto en espera`)
};

const en_xa2_ticket_toast_held = /** @type {(inputs: Ticket_Toast_HeldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} plàcèd òn hòld •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} placed on hold" |
*
* @param {Ticket_Toast_HeldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_held = /** @type {((inputs: Ticket_Toast_HeldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_HeldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_held(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_held(inputs)
	return en_ticket_toast_held(inputs)
});