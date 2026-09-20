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

const en_xa2_demo_section_client_privacy_desc = /** @type {(inputs: Demo_Section_Client_Privacy_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè prìvàcy nòtìcè pàgè èxplàìns whàt dàtà thè òrgànìzàtìòn còllècts, hòw lòng ìt ìs rètàìnèd, ànd whàt èncryptìòn pròtèctìòns àpply. ••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The privacy notice page explains what data the organization collects, how long it is retained, and what encryption protections apply." |
*
* @param {Demo_Section_Client_Privacy_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_privacy_desc = /** @type {((inputs?: Demo_Section_Client_Privacy_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Privacy_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_privacy_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_privacy_desc(inputs)
	return en_demo_section_client_privacy_desc(inputs)
});