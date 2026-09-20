/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_MismatchInputs */

const en_portal_passphrase_mismatch = /** @type {(inputs: Portal_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match.`)
};

const es_portal_passphrase_mismatch = /** @type {(inputs: Portal_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las contraseñas no coinciden.`)
};

const en_xa2_portal_passphrase_mismatch = /** @type {(inputs: Portal_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrds dò nòt màtch. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Portal_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_mismatch = /** @type {((inputs?: Portal_Passphrase_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_mismatch(inputs)
	return en_portal_passphrase_mismatch(inputs)
});