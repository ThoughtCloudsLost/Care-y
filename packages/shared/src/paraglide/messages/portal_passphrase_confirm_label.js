/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Confirm_LabelInputs */

const en_portal_passphrase_confirm_label = /** @type {(inputs: Portal_Passphrase_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm password`)
};

const es_portal_passphrase_confirm_label = /** @type {(inputs: Portal_Passphrase_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar contraseña`)
};

const en_xa2_portal_passphrase_confirm_label = /** @type {(inputs: Portal_Passphrase_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Portal_Passphrase_Confirm_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_confirm_label = /** @type {((inputs?: Portal_Passphrase_Confirm_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Confirm_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_confirm_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_confirm_label(inputs)
	return en_portal_passphrase_confirm_label(inputs)
});