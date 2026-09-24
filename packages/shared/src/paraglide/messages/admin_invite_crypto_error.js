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

const en_xa2_admin_invite_crypto_error = /** @type {(inputs: Admin_Invite_Crypto_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt wàs crèàtèd, bùt kèy dìstrìbùtìòn fàìlèd. Thè òrgànìzàtìòn kèy wìll bè dìstrìbùtèd àùtòmàtìcàlly whèn àn àdmìn nèxt lògs ìn. ••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Account was created, but key distribution failed. The organization key will be distributed automatically when an admin next logs in." |
*
* @param {Admin_Invite_Crypto_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_crypto_error = /** @type {((inputs?: Admin_Invite_Crypto_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Crypto_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_crypto_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_crypto_error(inputs)
	return en_admin_invite_crypto_error(inputs)
});