/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_FundsInputs */

const en_roles_group_funds = /** @type {(inputs: Roles_Group_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funds`)
};

const es_roles_group_funds = /** @type {(inputs: Roles_Group_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondos`)
};

const en_xa2_roles_group_funds = /** @type {(inputs: Roles_Group_FundsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnds ••⟧`)
};

/**
* | output |
* | --- |
* | "Funds" |
*
* @param {Roles_Group_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_funds = /** @type {((inputs?: Roles_Group_FundsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_FundsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_funds(inputs)
	if (locale === "en-XA") return en_xa2_roles_group_funds(inputs)
	return en_roles_group_funds(inputs)
});