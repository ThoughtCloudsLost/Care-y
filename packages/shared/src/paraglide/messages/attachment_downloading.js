/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown> }} Attachment_DownloadingInputs */

const en_attachment_downloading = /** @type {(inputs: Attachment_DownloadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Downloading ${i?.filename}...`)
};

const es_attachment_downloading = /** @type {(inputs: Attachment_DownloadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Descargando ${i?.filename}...`)
};

const en_xa2_attachment_downloading = /** @type {(inputs: Attachment_DownloadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dòwnlòàdìng  ••••${i?.filename}... •⟧`)
};

/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Attachment_DownloadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_downloading = /** @type {((inputs: Attachment_DownloadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_DownloadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_downloading(inputs)
	if (locale === "en-XA") return en_xa2_attachment_downloading(inputs)
	return en_attachment_downloading(inputs)
});