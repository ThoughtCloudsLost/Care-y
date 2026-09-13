/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Card_TitleInputs */

const en_account_upgrade_card_title = /** @type {(inputs: Account_Upgrade_Card_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a password to this conversation`)
};

const es_account_upgrade_card_title = /** @type {(inputs: Account_Upgrade_Card_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega una contraseña a esta conversación`)
};

/**
* | output |
* | --- |
* | "Add a password to this conversation" |
*
* @param {Account_Upgrade_Card_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_title = /** @type {((inputs?: Account_Upgrade_Card_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Card_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_upgrade_card_title(inputs)
	return es_account_upgrade_card_title(inputs)
});