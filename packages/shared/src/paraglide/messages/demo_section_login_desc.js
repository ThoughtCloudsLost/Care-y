/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How signing in verifies the volunteer and derives the encryption keys in the browser.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo el inicio de sesión verifica al voluntario y deriva las claves de cifrado en el navegador.`)
};

const en_xa2_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw sìgnìng ìn vèrìfìès thè vòlùntèèr ànd dèrìvès thè èncryptìòn kèys ìn thè bròwsèr. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How signing in verifies the volunteer and derives the encryption keys in the browser." |
*
* @param {Demo_Section_Login_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_login_desc = /** @type {((inputs?: Demo_Section_Login_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Login_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_login_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_login_desc(inputs)
	return en_demo_section_login_desc(inputs)
});