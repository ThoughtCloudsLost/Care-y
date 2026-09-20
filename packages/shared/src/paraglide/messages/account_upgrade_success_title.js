/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Success_TitleInputs */

const en_account_upgrade_success_title = /** @type {(inputs: Account_Upgrade_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your account is ready`)
};

const es_account_upgrade_success_title = /** @type {(inputs: Account_Upgrade_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu cuenta está lista`)
};

const en_xa2_account_upgrade_success_title = /** @type {(inputs: Account_Upgrade_Success_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr àccòùnt ìs rèàdy •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your account is ready" |
*
* @param {Account_Upgrade_Success_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_success_title = /** @type {((inputs?: Account_Upgrade_Success_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Success_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_upgrade_success_title(inputs)
	if (locale === "en-XA") return en_xa2_account_upgrade_success_title(inputs)
	return en_account_upgrade_success_title(inputs)
});