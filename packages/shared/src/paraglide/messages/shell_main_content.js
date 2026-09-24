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

const en_xa2_shell_main_content = /** @type {(inputs: Shell_Main_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màìn còntènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Main content" |
*
* @param {Shell_Main_ContentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const shell_main_content = /** @type {((inputs?: Shell_Main_ContentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Shell_Main_ContentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_shell_main_content(inputs)
	if (locale === "en-XA") return en_xa2_shell_main_content(inputs)
	return en_shell_main_content(inputs)
});