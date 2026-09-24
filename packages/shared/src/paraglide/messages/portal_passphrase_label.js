/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_LabelInputs */

const en_portal_passphrase_label = /** @type {(inputs: Portal_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrase`)
};

const es_portal_passphrase_label = /** @type {(inputs: Portal_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Frase de acceso`)
};

const en_xa2_portal_passphrase_label = /** @type {(inputs: Portal_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàssphràsè •••⟧`)
};

/**
* | output |
* | --- |
* | "Passphrase" |
*
* @param {Portal_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_label = /** @type {((inputs?: Portal_Passphrase_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_label(inputs)
	return en_portal_passphrase_label(inputs)
});