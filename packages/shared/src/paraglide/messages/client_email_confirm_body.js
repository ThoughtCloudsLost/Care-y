/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown>, tickets: NonNullable<unknown> }} Client_Email_Confirm_BodyInputs */

const en_client_email_confirm_body = /** @type {(inputs: Client_Email_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This changes the email for ${i?.alias} across all their ${i?.tickets}.`)
};

const es_client_email_confirm_body = /** @type {(inputs: Client_Email_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esto cambia el correo de ${i?.alias} en todos sus ${i?.tickets}.`)
};

/**
* | output |
* | --- |
* | "This changes the email for {alias} across all their {tickets}." |
*
* @param {Client_Email_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_confirm_body = /** @type {((inputs: Client_Email_Confirm_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Confirm_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_email_confirm_body(inputs)
	return es_client_email_confirm_body(inputs)
});