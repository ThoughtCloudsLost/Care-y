/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Privacy_DescInputs */

const en_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The privacy notice page explains what data the organization collects, how long it is retained, and what encryption protections apply.`)
};

const es_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de aviso de privacidad explica qué datos recopila la organización, durante cuánto tiempo se retienen y qué protecciones de cifrado se aplican.`)
};

/**
* | output |
* | --- |
* | "The privacy notice page explains what data the organization collects, how long it is retained, and what encryption protections apply." |
*
* @param {Demo_Section_Client_Privacy_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_privacy_desc = /** @type {((inputs?: Demo_Section_Client_Privacy_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Privacy_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_privacy_desc(inputs)
	return en_demo_section_client_privacy_desc(inputs)
});