/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Ticket_Action_Client_InfoInputs */

const en_ticket_action_client_info = /** @type {(inputs: Ticket_Action_Client_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} Info`)
};

const es_ticket_action_client_info = /** @type {(inputs: Ticket_Action_Client_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Info del ${i?.client}`)
};

/**
* | output |
* | --- |
* | "{Client} Info" |
*
* @param {Ticket_Action_Client_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_client_info = /** @type {((inputs: Ticket_Action_Client_InfoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Client_InfoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_client_info(inputs)
	return es_ticket_action_client_info(inputs)
});