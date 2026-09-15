/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Claim_CasesInputs */

const en_permission_claim_cases = /** @type {(inputs: Permission_Claim_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claim cases`)
};

const es_permission_claim_cases = /** @type {(inputs: Permission_Claim_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reclamar casos`)
};

/**
* | output |
* | --- |
* | "Claim cases" |
*
* @param {Permission_Claim_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_claim_cases = /** @type {((inputs?: Permission_Claim_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Claim_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_claim_cases(inputs)
	return en_permission_claim_cases(inputs)
});