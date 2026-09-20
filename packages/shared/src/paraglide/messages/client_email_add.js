/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_AddInputs */

const en_client_email_add = /** @type {(inputs: Client_Email_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add email`)
};

const es_client_email_add = /** @type {(inputs: Client_Email_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Añadir correo`)
};

const en_xa2_client_email_add = /** @type {(inputs: Client_Email_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd èmàìl •••⟧`)
};

/**
* | output |
* | --- |
* | "Add email" |
*
* @param {Client_Email_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_email_add = /** @type {((inputs?: Client_Email_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_email_add(inputs)
	if (locale === "en-XA") return en_xa2_client_email_add(inputs)
	return en_client_email_add(inputs)
});