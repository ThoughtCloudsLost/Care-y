/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Upgrade_Add_PassphraseInputs */

const en_portal_upgrade_add_passphrase = /** @type {(inputs: Portal_Upgrade_Add_PassphraseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a password to this link`)
};

const es_portal_upgrade_add_passphrase = /** @type {(inputs: Portal_Upgrade_Add_PassphraseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar una contraseña a este enlace`)
};

/**
* | output |
* | --- |
* | "Add a password to this link" |
*
* @param {Portal_Upgrade_Add_PassphraseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_add_passphrase = /** @type {((inputs?: Portal_Upgrade_Add_PassphraseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Add_PassphraseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_upgrade_add_passphrase(inputs)
	return es_portal_upgrade_add_passphrase(inputs)
});