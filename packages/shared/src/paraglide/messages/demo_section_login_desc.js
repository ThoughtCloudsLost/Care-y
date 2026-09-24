/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How credentials protect case data before it reaches the server.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo las credenciales protegen los datos de los casos antes de que lleguen al servidor.`)
};

const en_xa2_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw crèdèntìàls pròtèct càsè dàtà bèfòrè ìt rèàchès thè sèrvèr. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How credentials protect case data before it reaches the server." |
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