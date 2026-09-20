/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Status_OpenedInputs */

const en_ticket_system_status_opened = /** @type {(inputs: Ticket_System_Status_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reopened`)
};

const es_ticket_system_status_opened = /** @type {(inputs: Ticket_System_Status_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reabierto`)
};

const en_xa2_ticket_system_status_opened = /** @type {(inputs: Ticket_System_Status_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèòpènèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Ticket_System_Status_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_status_opened = /** @type {((inputs?: Ticket_System_Status_OpenedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Status_OpenedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_status_opened(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_status_opened(inputs)
	return en_ticket_system_status_opened(inputs)
});