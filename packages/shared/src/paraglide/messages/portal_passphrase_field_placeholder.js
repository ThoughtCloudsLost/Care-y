/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Field_PlaceholderInputs */

const en_portal_passphrase_field_placeholder = /** @type {(inputs: Portal_Passphrase_Field_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a password`)
};

const es_portal_passphrase_field_placeholder = /** @type {(inputs: Portal_Passphrase_Field_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa una contraseña`)
};

const en_xa2_portal_passphrase_field_placeholder = /** @type {(inputs: Portal_Passphrase_Field_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a password" |
*
* @param {Portal_Passphrase_Field_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_field_placeholder = /** @type {((inputs?: Portal_Passphrase_Field_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Field_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_field_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_field_placeholder(inputs)
	return en_portal_passphrase_field_placeholder(inputs)
});