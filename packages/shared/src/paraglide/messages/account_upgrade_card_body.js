/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Card_BodyInputs */

const en_account_upgrade_card_body = /** @type {(inputs: Account_Upgrade_Card_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password protects your messages even if this link is found.`)
};

const es_account_upgrade_card_body = /** @type {(inputs: Account_Upgrade_Card_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contraseña protege tus mensajes aunque alguien encuentre este enlace.`)
};

/**
* | output |
* | --- |
* | "A password protects your messages even if this link is found." |
*
* @param {Account_Upgrade_Card_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_body = /** @type {((inputs?: Account_Upgrade_Card_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Card_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_upgrade_card_body(inputs)
	return es_account_upgrade_card_body(inputs)
});