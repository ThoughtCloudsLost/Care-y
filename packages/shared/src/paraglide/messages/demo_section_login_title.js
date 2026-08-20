/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_TitleInputs */

const en_demo_section_login_title = /** @type {(inputs: Demo_Section_Login_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login and security`)
};

const es_demo_section_login_title = /** @type {(inputs: Demo_Section_Login_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inicio de sesión y seguridad`)
};

/**
* | output |
* | --- |
* | "Login and security" |
*
* @param {Demo_Section_Login_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_login_title = /** @type {((inputs?: Demo_Section_Login_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Login_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_login_title(inputs)
	return es_demo_section_login_title(inputs)
});