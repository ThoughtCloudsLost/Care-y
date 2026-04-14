/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Decrypt_Placeholder_DeniedInputs */

const en_decrypt_placeholder_denied = /** @type {(inputs: Decrypt_Placeholder_DeniedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No access to this content`)
};

const es_decrypt_placeholder_denied = /** @type {(inputs: Decrypt_Placeholder_DeniedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin acceso a este contenido`)
};

/**
* | output |
* | --- |
* | "No access to this content" |
*
* @param {Decrypt_Placeholder_DeniedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_denied = /** @type {((inputs?: Decrypt_Placeholder_DeniedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Decrypt_Placeholder_DeniedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_decrypt_placeholder_denied(inputs)
	return es_decrypt_placeholder_denied(inputs)
});