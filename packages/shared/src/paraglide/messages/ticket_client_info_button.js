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

const en_xa2_ticket_client_info_button = /** @type {(inputs: Ticket_Client_Info_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Vìèw ìnfò fòr  •••••${i?.alias}⟧`)
};

/**
* | output |
* | --- |
* | "View info for {alias}" |
*
* @param {Ticket_Client_Info_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_client_info_button = /** @type {((inputs: Ticket_Client_Info_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Client_Info_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_client_info_button(inputs)
	if (locale === "en-XA") return en_xa2_ticket_client_info_button(inputs)
	return en_ticket_client_info_button(inputs)
});