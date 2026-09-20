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

const en_xa2_error_ticket_key_generation_stale = /** @type {(inputs: Error_Ticket_Key_Generation_StaleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.ticket} wàs ùpdàtèd èlsèwhèrè. Clòsè ànd rèòpèn thè èdìtòr tò rètry. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This {ticket} was updated elsewhere. Close and reopen the editor to retry." |
*
* @param {Error_Ticket_Key_Generation_StaleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_key_generation_stale = /** @type {((inputs: Error_Ticket_Key_Generation_StaleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Key_Generation_StaleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_ticket_key_generation_stale(inputs)
	if (locale === "en-XA") return en_xa2_error_ticket_key_generation_stale(inputs)
	return en_error_ticket_key_generation_stale(inputs)
});