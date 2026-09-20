/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Assign_CasesInputs */

const en_permission_assign_cases = /** @type {(inputs: Permission_Assign_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign cases`)
};

const es_permission_assign_cases = /** @type {(inputs: Permission_Assign_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar casos`)
};

const en_xa2_permission_assign_cases = /** @type {(inputs: Permission_Assign_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgn càsès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Assign cases" |
*
* @param {Permission_Assign_CasesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_assign_cases = /** @type {((inputs?: Permission_Assign_CasesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Assign_CasesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_assign_cases(inputs)
	if (locale === "en-XA") return en_xa2_permission_assign_cases(inputs)
	return en_permission_assign_cases(inputs)
});