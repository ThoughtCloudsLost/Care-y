/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_EditInputs */

const en_client_email_edit = /** @type {(inputs: Client_Email_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit email`)
};

const es_client_email_edit = /** @type {(inputs: Client_Email_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar correo`)
};

/**
* | output |
* | --- |
* | "Edit email" |
*
* @param {Client_Email_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_edit = /** @type {((inputs?: Client_Email_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_email_edit(inputs)
	return es_client_email_edit(inputs)
});