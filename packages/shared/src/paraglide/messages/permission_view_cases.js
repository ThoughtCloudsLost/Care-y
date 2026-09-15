/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_CasesInputs */

const en_permission_view_cases = /** @type {(inputs: Permission_View_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View cases`)
};

const es_permission_view_cases = /** @type {(inputs: Permission_View_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver casos`)
};

/**
* | output |
* | --- |
* | "View cases" |
*
* @param {Permission_View_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_cases = /** @type {((inputs?: Permission_View_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_cases(inputs)
	return en_permission_view_cases(inputs)
});