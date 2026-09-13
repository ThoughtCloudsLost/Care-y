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

/**
* | output |
* | --- |
* | "Your account is ready" |
*
* @param {Account_Upgrade_Success_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_success_title = /** @type {((inputs?: Account_Upgrade_Success_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Success_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_upgrade_success_title(inputs)
	return es_account_upgrade_success_title(inputs)
});