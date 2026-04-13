/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Ticket_Client_Info_ButtonInputs */

const en_ticket_client_info_button = /** @type {(inputs: Ticket_Client_Info_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`View info for ${i?.alias}`)
};

const es_ticket_client_info_button = /** @type {(inputs: Ticket_Client_Info_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver info de ${i?.alias}`)
};

/**
* | output |
* | --- |
* | "View info for {alias}" |
*
* @param {Ticket_Client_Info_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_client_info_button = /** @type {((inputs: Ticket_Client_Info_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Client_Info_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_client_info_button(inputs)
	return es_ticket_client_info_button(inputs)
});