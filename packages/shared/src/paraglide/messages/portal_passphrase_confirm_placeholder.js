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

const en_xa2_portal_passphrase_confirm_placeholder = /** @type {(inputs: Portal_Passphrase_Confirm_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè sàmè pàsswòrd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the same password" |
*
* @param {Portal_Passphrase_Confirm_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_confirm_placeholder = /** @type {((inputs?: Portal_Passphrase_Confirm_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Confirm_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_confirm_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_confirm_placeholder(inputs)
	return en_portal_passphrase_confirm_placeholder(inputs)
});