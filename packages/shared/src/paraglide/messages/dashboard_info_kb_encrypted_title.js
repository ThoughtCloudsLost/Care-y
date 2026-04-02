/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_Kb_Encrypted_TitleInputs */

const en_dashboard_info_kb_encrypted_title = /** @type {(inputs: Dashboard_Info_Kb_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Updated article`)
};

const es_dashboard_info_kb_encrypted_title = /** @type {(inputs: Dashboard_Info_Kb_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Articulo actualizado`)
};

/**
* | output |
* | --- |
* | "Updated article" |
*
* @param {Dashboard_Info_Kb_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_kb_encrypted_title = /** @type {((inputs?: Dashboard_Info_Kb_Encrypted_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_Kb_Encrypted_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_kb_encrypted_title(inputs)
	return es_dashboard_info_kb_encrypted_title(inputs)
});