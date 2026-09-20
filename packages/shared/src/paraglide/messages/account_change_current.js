/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Change_CurrentInputs */

const en_account_change_current = /** @type {(inputs: Account_Change_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password`)
};

const es_account_change_current = /** @type {(inputs: Account_Change_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña actual`)
};

const en_xa2_account_change_current = /** @type {(inputs: Account_Change_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrènt pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Account_Change_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_change_current = /** @type {((inputs?: Account_Change_CurrentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Change_CurrentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_change_current(inputs)
	if (locale === "en-XA") return en_xa2_account_change_current(inputs)
	return en_account_change_current(inputs)
});