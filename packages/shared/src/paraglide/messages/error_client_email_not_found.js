/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Client_Email_Not_FoundInputs */

const en_error_client_email_not_found = /** @type {(inputs: Error_Client_Email_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No email address on file for this ${i?.client}.`)
};

const es_error_client_email_not_found = /** @type {(inputs: Error_Client_Email_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay dirección de correo registrada para este ${i?.client}.`)
};

const en_xa2_error_client_email_not_found = /** @type {(inputs: Error_Client_Email_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò èmàìl àddrèss òn fìlè fòr thìs  •••••••••••${i?.client}. •⟧`)
};

/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Error_Client_Email_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_client_email_not_found = /** @type {((inputs: Error_Client_Email_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Client_Email_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_client_email_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_client_email_not_found(inputs)
	return en_error_client_email_not_found(inputs)
});