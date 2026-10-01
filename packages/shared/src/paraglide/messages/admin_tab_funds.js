/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_FundsInputs */

const en_admin_tab_funds = /** @type {(inputs: Admin_Tab_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funds`)
};

const es_admin_tab_funds = /** @type {(inputs: Admin_Tab_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondos`)
};

const en_xa2_admin_tab_funds = /** @type {(inputs: Admin_Tab_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnds ••⟧`)
};

/**
* | output |
* | --- |
* | "Funds" |
*
* @param {Admin_Tab_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_funds = /** @type {((inputs?: Admin_Tab_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_funds(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_funds(inputs)
	return en_admin_tab_funds(inputs)
});