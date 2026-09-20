/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Open_CasesInputs */

const en_permission_open_cases = /** @type {(inputs: Permission_Open_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open cases`)
};

const es_permission_open_cases = /** @type {(inputs: Permission_Open_CasesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir casos`)
};

/**
* | output |
* | --- |
* | "Open cases" |
*
* @param {Permission_Open_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_open_cases = /** @type {((inputs?: Permission_Open_CasesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Open_CasesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_open_cases(inputs)
	return en_permission_open_cases(inputs)
});