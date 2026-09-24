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

const en_xa2_attachment_download = /** @type {(inputs: Attachment_DownloadInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dòwnlòàd  •••${i?.filename}⟧`)
};

/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Attachment_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_download = /** @type {((inputs: Attachment_DownloadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_DownloadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_download(inputs)
	if (locale === "en-XA") return en_xa2_attachment_download(inputs)
	return en_attachment_download(inputs)
});