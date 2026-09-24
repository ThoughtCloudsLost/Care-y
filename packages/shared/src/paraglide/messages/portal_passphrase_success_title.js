/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Success_TitleInputs */

const en_portal_passphrase_success_title = /** @type {(inputs: Portal_Passphrase_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password added`)
};

const es_portal_passphrase_success_title = /** @type {(inputs: Portal_Passphrase_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña agregada`)
};

const en_xa2_portal_passphrase_success_title = /** @type {(inputs: Portal_Passphrase_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd àddèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Password added" |
*
* @param {Portal_Passphrase_Success_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_title = /** @type {((inputs?: Portal_Passphrase_Success_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Success_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_success_title(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_success_title(inputs)
	return en_portal_passphrase_success_title(inputs)
});