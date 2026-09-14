/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Crypto_ErrorInputs */

const en_admin_invite_crypto_error = /** @type {(inputs: Admin_Invite_Crypto_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account was created, but key distribution failed. The organization key will be distributed automatically when an admin next logs in.`)
};

const es_admin_invite_crypto_error = /** @type {(inputs: Admin_Invite_Crypto_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La cuenta fue creada, pero la distribución de claves fallo. La clave de la organización se distribuira automáticamente cuando un administrador inicie sesión.`)
};

/**
* | output |
* | --- |
* | "Account was created, but key distribution failed. The organization key will be distributed automatically when an admin next logs in." |
*
* @param {Admin_Invite_Crypto_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_error = /** @type {((inputs?: Admin_Invite_Crypto_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_crypto_error(inputs)
	return en_admin_invite_crypto_error(inputs)
});