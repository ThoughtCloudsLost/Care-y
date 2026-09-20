/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_SetupInputs */

const en_account_upgrade_setup = /** @type {(inputs: Account_Upgrade_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up account`)
};

const es_account_upgrade_setup = /** @type {(inputs: Account_Upgrade_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cuenta`)
};

const en_xa2_account_upgrade_setup = /** @type {(inputs: Account_Upgrade_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp àccòùnt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up account" |
*
* @param {Account_Upgrade_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_setup = /** @type {((inputs?: Account_Upgrade_SetupInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_SetupInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_upgrade_setup(inputs)
	if (locale === "en-XA") return en_xa2_account_upgrade_setup(inputs)
	return en_account_upgrade_setup(inputs)
});