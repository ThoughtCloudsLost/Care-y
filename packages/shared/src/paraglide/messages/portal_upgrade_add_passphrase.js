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

const en_xa2_portal_upgrade_add_passphrase = /** @type {(inputs: Portal_Upgrade_Add_PassphraseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à pàsswòrd tò thìs lìnk •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a password to this link" |
*
* @param {Portal_Upgrade_Add_PassphraseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_add_passphrase = /** @type {((inputs?: Portal_Upgrade_Add_PassphraseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Add_PassphraseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_add_passphrase(inputs)
	if (locale === "en-XA") return en_xa2_portal_upgrade_add_passphrase(inputs)
	return en_portal_upgrade_add_passphrase(inputs)
});