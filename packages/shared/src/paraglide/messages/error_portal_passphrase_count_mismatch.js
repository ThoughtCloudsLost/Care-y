/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Passphrase_Count_MismatchInputs */

const en_error_portal_passphrase_count_mismatch = /** @type {(inputs: Error_Portal_Passphrase_Count_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your messages changed while adding the password. Try again.`)
};

const es_error_portal_passphrase_count_mismatch = /** @type {(inputs: Error_Portal_Passphrase_Count_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus mensajes cambiaron mientras se agregaba la contraseña. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Your messages changed while adding the password. Try again." |
*
* @param {Error_Portal_Passphrase_Count_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_passphrase_count_mismatch = /** @type {((inputs?: Error_Portal_Passphrase_Count_MismatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Passphrase_Count_MismatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_passphrase_count_mismatch(inputs)
	return en_error_portal_passphrase_count_mismatch(inputs)
});