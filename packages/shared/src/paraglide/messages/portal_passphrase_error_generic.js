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

const en_xa2_portal_passphrase_error_generic = /** @type {(inputs: Portal_Passphrase_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmèthìng wènt wròng. Try àgàìn. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Something went wrong. Try again." |
*
* @param {Portal_Passphrase_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_generic = /** @type {((inputs?: Portal_Passphrase_Error_GenericInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Error_GenericInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_error_generic(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_error_generic(inputs)
	return en_portal_passphrase_error_generic(inputs)
});