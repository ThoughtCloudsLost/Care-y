/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_Changed_ToastInputs */

const en_client_email_changed_toast = /** @type {(inputs: Client_Email_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email address updated`)
};

const es_client_email_changed_toast = /** @type {(inputs: Client_Email_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dirección de correo actualizada`)
};

/**
* | output |
* | --- |
* | "Email address updated" |
*
* @param {Client_Email_Changed_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_changed_toast = /** @type {((inputs?: Client_Email_Changed_ToastInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Changed_ToastInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_email_changed_toast(inputs)
	return en_client_email_changed_toast(inputs)
});