/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_FundsInputs */

const en_permission_manage_funds = /** @type {(inputs: Permission_Manage_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage funds`)
};

const es_permission_manage_funds = /** @type {(inputs: Permission_Manage_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar fondos`)
};

const en_xa2_permission_manage_funds = /** @type {(inputs: Permission_Manage_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè fùnds ••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage funds" |
*
* @param {Permission_Manage_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_funds = /** @type {((inputs?: Permission_Manage_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_funds(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_funds(inputs)
	return en_permission_manage_funds(inputs)
});