/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Privacy_TitleInputs */

const en_demo_section_client_privacy_title = /** @type {(inputs: Demo_Section_Client_Privacy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Privacy notice`)
};

const es_demo_section_client_privacy_title = /** @type {(inputs: Demo_Section_Client_Privacy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aviso de privacidad`)
};

const en_xa2_demo_section_client_privacy_title = /** @type {(inputs: Demo_Section_Client_Privacy_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìvàcy nòtìcè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Privacy notice" |
*
* @param {Demo_Section_Client_Privacy_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_privacy_title = /** @type {((inputs?: Demo_Section_Client_Privacy_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Privacy_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_privacy_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_privacy_title(inputs)
	return en_demo_section_client_privacy_title(inputs)
});