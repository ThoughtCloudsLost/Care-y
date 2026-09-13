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

/**
* | output |
* | --- |
* | "Passphrase" |
*
* @param {Portal_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_label = /** @type {((inputs?: Portal_Passphrase_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_label(inputs)
	return es_portal_passphrase_label(inputs)
});