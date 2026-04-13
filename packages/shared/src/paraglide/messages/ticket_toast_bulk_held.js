/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Toast_Bulk_HeldInputs */

const en_ticket_toast_bulk_held = /** @type {(inputs: Ticket_Toast_Bulk_HeldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets placed on hold`)
};

const es_ticket_toast_bulk_held = /** @type {(inputs: Ticket_Toast_Bulk_HeldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets puestos en espera`)
};

/**
* | output |
* | --- |
* | "{count} tickets placed on hold" |
*
* @param {Ticket_Toast_Bulk_HeldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_held = /** @type {((inputs: Ticket_Toast_Bulk_HeldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Bulk_HeldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_bulk_held(inputs)
	return es_ticket_toast_bulk_held(inputs)
});