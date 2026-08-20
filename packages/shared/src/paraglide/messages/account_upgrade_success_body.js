/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Success_BodyInputs */

const en_account_upgrade_success_body = /** @type {(inputs: Account_Upgrade_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link no longer works. From now on, sign in at /account with your password. Your messages moved with you.`)
};

const es_account_upgrade_success_body = /** @type {(inputs: Account_Upgrade_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ya no funciona. A partir de ahora, inicia sesión en /account con tu contraseña. Tus mensajes se transfirieron contigo.`)
};

/**
* | output |
* | --- |
* | "This link no longer works. From now on, sign in at /account with your password. Your messages moved with you." |
*
* @param {Account_Upgrade_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_success_body = /** @type {((inputs?: Account_Upgrade_Success_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Success_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_upgrade_success_body(inputs)
	return es_account_upgrade_success_body(inputs)
});