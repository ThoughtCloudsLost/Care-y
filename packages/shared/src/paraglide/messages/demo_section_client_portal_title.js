/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Portal_TitleInputs */

const en_demo_section_client_portal_title = /** @type {(inputs: Demo_Section_Client_Portal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure portal`)
};

const es_demo_section_client_portal_title = /** @type {(inputs: Demo_Section_Client_Portal_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Portal seguro`)
};

/**
* | output |
* | --- |
* | "Secure portal" |
*
* @param {Demo_Section_Client_Portal_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_title = /** @type {((inputs?: Demo_Section_Client_Portal_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Portal_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_portal_title(inputs)
	return en_demo_section_client_portal_title(inputs)
});