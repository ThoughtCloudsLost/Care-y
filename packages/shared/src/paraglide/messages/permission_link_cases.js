/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Link_CasesInputs */

const en_permission_link_cases = /** @type {(inputs: Permission_Link_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link cases together`)
};

const es_permission_link_cases = /** @type {(inputs: Permission_Link_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vincular casos entre si`)
};

/**
* | output |
* | --- |
* | "Link cases together" |
*
* @param {Permission_Link_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_link_cases = /** @type {((inputs?: Permission_Link_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Link_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_link_cases(inputs)
	return en_permission_link_cases(inputs)
});