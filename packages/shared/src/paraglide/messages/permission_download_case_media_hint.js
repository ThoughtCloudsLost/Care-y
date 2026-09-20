/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Download_Case_Media_HintInputs */

const en_permission_download_case_media_hint = /** @type {(inputs: Permission_Download_Case_Media_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Covers call recordings and attached files.`)
};

const es_permission_download_case_media_hint = /** @type {(inputs: Permission_Download_Case_Media_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Incluye grabaciones de llamadas y archivos adjuntos.`)
};

/**
* | output |
* | --- |
* | "Covers call recordings and attached files." |
*
* @param {Permission_Download_Case_Media_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_download_case_media_hint = /** @type {((inputs?: Permission_Download_Case_Media_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Download_Case_Media_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_download_case_media_hint(inputs)
	return en_permission_download_case_media_hint(inputs)
});