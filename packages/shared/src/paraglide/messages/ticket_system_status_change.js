/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ status: NonNullable<unknown> }} Ticket_System_Status_ChangeInputs */

const en_ticket_system_status_change = /** @type {(inputs: Ticket_System_Status_ChangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Status changed to ${i?.status}`)
};

const es_ticket_system_status_change = /** @type {(inputs: Ticket_System_Status_ChangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Estado cambiado a ${i?.status}`)
};

/**
* | output |
* | --- |
* | "Status changed to {status}" |
*
* @param {Ticket_System_Status_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_status_change = /** @type {((inputs: Ticket_System_Status_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Status_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_status_change(inputs)
	return es_ticket_system_status_change(inputs)
});