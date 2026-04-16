/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Shell_Main_ContentInputs */

const en_shell_main_content = /** @type {(inputs: Shell_Main_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Main content`)
};

const es_shell_main_content = /** @type {(inputs: Shell_Main_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido principal`)
};

/**
* | output |
* | --- |
* | "Main content" |
*
* @param {Shell_Main_ContentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const shell_main_content = /** @type {((inputs?: Shell_Main_ContentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Shell_Main_ContentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_shell_main_content(inputs)
	return es_shell_main_content(inputs)
});