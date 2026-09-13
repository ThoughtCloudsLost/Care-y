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

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Account_Upgrade_Card_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_card_dismiss = /** @type {((inputs?: Account_Upgrade_Card_DismissInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Upgrade_Card_DismissInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_upgrade_card_dismiss(inputs)
	return es_account_upgrade_card_dismiss(inputs)
});