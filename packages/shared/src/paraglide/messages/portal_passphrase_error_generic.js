/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Error_GenericInputs */

const en_portal_passphrase_error_generic = /** @type {(inputs: Portal_Passphrase_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Something went wrong. Try again.`)
};

const es_portal_passphrase_error_generic = /** @type {(inputs: Portal_Passphrase_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algo salió mal. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Something went wrong. Try again." |
*
* @param {Portal_Passphrase_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_generic = /** @type {((inputs?: Portal_Passphrase_Error_GenericInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Error_GenericInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_error_generic(inputs)
	return es_portal_passphrase_error_generic(inputs)
});