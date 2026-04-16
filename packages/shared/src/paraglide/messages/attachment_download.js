/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown> }} Attachment_DownloadInputs */

const en_attachment_download = /** @type {(inputs: Attachment_DownloadInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Download ${i?.filename}`)
};

const es_attachment_download = /** @type {(inputs: Attachment_DownloadInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Descargar ${i?.filename}`)
};

/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Attachment_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_download = /** @type {((inputs: Attachment_DownloadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_DownloadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_attachment_download(inputs)
	return es_attachment_download(inputs)
});