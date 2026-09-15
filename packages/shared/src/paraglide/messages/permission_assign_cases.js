/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Assign_CasesInputs */

const en_permission_assign_cases = /** @type {(inputs: Permission_Assign_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign cases to other people`)
};

const es_permission_assign_cases = /** @type {(inputs: Permission_Assign_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar casos a otras personas`)
};

/**
* | output |
* | --- |
* | "Assign cases to other people" |
*
* @param {Permission_Assign_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_assign_cases = /** @type {((inputs?: Permission_Assign_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Assign_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_assign_cases(inputs)
	return en_permission_assign_cases(inputs)
});