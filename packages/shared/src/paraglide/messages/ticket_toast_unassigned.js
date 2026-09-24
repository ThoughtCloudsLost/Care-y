/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_Toast_UnassignedInputs */

const en_ticket_toast_unassigned = /** @type {(inputs: Ticket_Toast_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} unassigned`)
};

const es_ticket_toast_unassigned = /** @type {(inputs: Ticket_Toast_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} sin asignar`)
};

const en_xa2_ticket_toast_unassigned = /** @type {(inputs: Ticket_Toast_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} ùnàssìgnèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} unassigned" |
*
* @param {Ticket_Toast_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unassigned = /** @type {((inputs: Ticket_Toast_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_unassigned(inputs)
	return en_ticket_toast_unassigned(inputs)
});