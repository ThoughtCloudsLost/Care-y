/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Client_Tickets_HeadingInputs */

const en_client_tickets_heading = /** @type {(inputs: Client_Tickets_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const es_client_tickets_heading = /** @type {(inputs: Client_Tickets_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const en_xa2_client_tickets_heading = /** @type {(inputs: Client_Tickets_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Tickets}⟧`)
};

/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Client_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_tickets_heading = /** @type {((inputs: Client_Tickets_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Tickets_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_tickets_heading(inputs)
	if (locale === "en-XA") return en_xa2_client_tickets_heading(inputs)
	return en_client_tickets_heading(inputs)
});