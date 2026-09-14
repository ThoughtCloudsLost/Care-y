/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Field_LabelInputs */

const en_portal_passphrase_field_label = /** @type {(inputs: Portal_Passphrase_Field_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password`)
};

const es_portal_passphrase_field_label = /** @type {(inputs: Portal_Passphrase_Field_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña`)
};

/**
* | output |
* | --- |
* | "Password" |
*
* @param {Portal_Passphrase_Field_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_field_label = /** @type {((inputs?: Portal_Passphrase_Field_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Field_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_field_label(inputs)
	return en_portal_passphrase_field_label(inputs)
});