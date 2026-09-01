/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Confirm_PlaceholderInputs */

const en_portal_passphrase_confirm_placeholder = /** @type {(inputs: Portal_Passphrase_Confirm_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the same password`)
};

const es_portal_passphrase_confirm_placeholder = /** @type {(inputs: Portal_Passphrase_Confirm_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa la misma contraseña`)
};

/**
* | output |
* | --- |
* | "Enter the same password" |
*
* @param {Portal_Passphrase_Confirm_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_confirm_placeholder = /** @type {((inputs?: Portal_Passphrase_Confirm_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Confirm_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_confirm_placeholder(inputs)
	return es_portal_passphrase_confirm_placeholder(inputs)
});