/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Download_Case_MediaInputs */

const en_permission_download_case_media = /** @type {(inputs: Permission_Download_Case_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download recordings and files`)
};

const es_permission_download_case_media = /** @type {(inputs: Permission_Download_Case_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descargar grabaciones y archivos`)
};

/**
* | output |
* | --- |
* | "Download recordings and files" |
*
* @param {Permission_Download_Case_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_download_case_media = /** @type {((inputs?: Permission_Download_Case_MediaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Download_Case_MediaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_download_case_media(inputs)
	return en_permission_download_case_media(inputs)
});