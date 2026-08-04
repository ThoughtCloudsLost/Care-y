/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Error_Ticket_Key_Generation_StaleInputs */

const en_error_ticket_key_generation_stale = /** @type {(inputs: Error_Ticket_Key_Generation_StaleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.ticket} was updated elsewhere. Close and reopen the editor to retry.`)
};

const es_error_ticket_key_generation_stale = /** @type {(inputs: Error_Ticket_Key_Generation_StaleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este ${i?.ticket} fue actualizado en otro lugar. Cierra y vuelve a abrir el editor para reintentar.`)
};

/**
* | output |
* | --- |
* | "This {ticket} was updated elsewhere. Close and reopen the editor to retry." |
*
* @param {Error_Ticket_Key_Generation_StaleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_key_generation_stale = /** @type {((inputs: Error_Ticket_Key_Generation_StaleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Key_Generation_StaleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_key_generation_stale(inputs)
	return es_error_ticket_key_generation_stale(inputs)
});