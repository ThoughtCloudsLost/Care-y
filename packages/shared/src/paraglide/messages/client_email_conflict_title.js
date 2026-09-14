/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_Conflict_TitleInputs */

const en_client_email_conflict_title = /** @type {(inputs: Client_Email_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email conflict`)
};

const es_client_email_conflict_title = /** @type {(inputs: Client_Email_Conflict_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conflicto de correo`)
};

/**
* | output |
* | --- |
* | "Email conflict" |
*
* @param {Client_Email_Conflict_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_conflict_title = /** @type {((inputs?: Client_Email_Conflict_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Conflict_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_email_conflict_title(inputs)
	return en_client_email_conflict_title(inputs)
});