/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_Confirm_TitleInputs */

const en_client_email_confirm_title = /** @type {(inputs: Client_Email_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm email change`)
};

const es_client_email_confirm_title = /** @type {(inputs: Client_Email_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar cambio de correo`)
};

/**
* | output |
* | --- |
* | "Confirm email change" |
*
* @param {Client_Email_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_confirm_title = /** @type {((inputs?: Client_Email_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_email_confirm_title(inputs)
	return es_client_email_confirm_title(inputs)
});