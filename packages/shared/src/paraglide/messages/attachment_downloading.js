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

/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Attachment_DownloadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_downloading = /** @type {((inputs: Attachment_DownloadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_DownloadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_attachment_downloading(inputs)
	return es_attachment_downloading(inputs)
});