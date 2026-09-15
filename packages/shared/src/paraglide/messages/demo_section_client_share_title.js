/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Share_TitleInputs */

const en_demo_section_client_share_title = /** @type {(inputs: Demo_Section_Client_Share_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share link`)
};

const es_demo_section_client_share_title = /** @type {(inputs: Demo_Section_Client_Share_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace compartido`)
};

/**
* | output |
* | --- |
* | "Share link" |
*
* @param {Demo_Section_Client_Share_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_share_title = /** @type {((inputs?: Demo_Section_Client_Share_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Share_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_share_title(inputs)
	return en_demo_section_client_share_title(inputs)
});