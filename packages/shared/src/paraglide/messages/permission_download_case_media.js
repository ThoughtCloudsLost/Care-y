/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Download_Case_MediaInputs */

const en_permission_download_case_media = /** @type {(inputs: Permission_Download_Case_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download case media`)
};

const es_permission_download_case_media = /** @type {(inputs: Permission_Download_Case_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descargar archivos del caso`)
};

const en_xa2_permission_download_case_media = /** @type {(inputs: Permission_Download_Case_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dòwnlòàd càsè mèdìà ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Download case media" |
*
* @param {Permission_Download_Case_MediaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_download_case_media = /** @type {((inputs?: Permission_Download_Case_MediaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Download_Case_MediaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_download_case_media(inputs)
	if (locale === "en-XA") return en_xa2_permission_download_case_media(inputs)
	return en_permission_download_case_media(inputs)
});