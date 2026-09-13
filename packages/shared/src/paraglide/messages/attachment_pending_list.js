/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Attachment_Pending_ListInputs */

const en_attachment_pending_list = /** @type {(inputs: Attachment_Pending_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files on this message`)
};

const es_attachment_pending_list = /** @type {(inputs: Attachment_Pending_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos de este mensaje`)
};

/**
* | output |
* | --- |
* | "Files on this message" |
*
* @param {Attachment_Pending_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_pending_list = /** @type {((inputs?: Attachment_Pending_ListInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Pending_ListInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_attachment_pending_list(inputs)
	return es_attachment_pending_list(inputs)
});