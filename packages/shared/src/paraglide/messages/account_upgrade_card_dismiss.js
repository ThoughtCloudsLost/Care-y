/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Upgrade_Card_DismissInputs */

const en_account_upgrade_card_dismiss = /** @type {(inputs: Account_Upgrade_Card_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_account_upgrade_card_dismiss = /** @type {(inputs: Account_Upgrade_Card_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar`)
};

const en_xa2_account_upgrade_card_dismiss = /** @type {(inputs: Account_Upgrade_Card_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Account_Upgrade_Card_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_dismiss = /** @type {((inputs?: Account_Upgrade_Card_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Card_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_upgrade_card_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_account_upgrade_card_dismiss(inputs)
	return en_account_upgrade_card_dismiss(inputs)
});