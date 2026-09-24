/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Link_CasesInputs */

const en_permission_link_cases = /** @type {(inputs: Permission_Link_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link cases`)
};

const es_permission_link_cases = /** @type {(inputs: Permission_Link_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vincular casos`)
};

const en_xa2_permission_link_cases = /** @type {(inputs: Permission_Link_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk càsès •••⟧`)
};

/**
* | output |
* | --- |
* | "Link cases" |
*
* @param {Permission_Link_CasesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_link_cases = /** @type {((inputs?: Permission_Link_CasesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Link_CasesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_link_cases(inputs)
	if (locale === "en-XA") return en_xa2_permission_link_cases(inputs)
	return en_permission_link_cases(inputs)
});