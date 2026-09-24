/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_Toast_AssignedInputs */

const en_ticket_toast_assigned = /** @type {(inputs: Ticket_Toast_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Assigned to ${i?.name}`)
};

const es_ticket_toast_assigned = /** @type {(inputs: Ticket_Toast_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Asignado a ${i?.name}`)
};

const en_xa2_ticket_toast_assigned = /** @type {(inputs: Ticket_Toast_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnèd tò  ••••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Assigned to {name}" |
*
* @param {Ticket_Toast_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_assigned = /** @type {((inputs: Ticket_Toast_AssignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_AssignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_assigned(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_assigned(inputs)
	return en_ticket_toast_assigned(inputs)
});