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

const en_xa2_attachment_pending_list = /** @type {(inputs: Attachment_Pending_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìlès òn thìs mèssàgè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Files on this message" |
*
* @param {Attachment_Pending_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_pending_list = /** @type {((inputs?: Attachment_Pending_ListInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Pending_ListInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_pending_list(inputs)
	if (locale === "en-XA") return en_xa2_attachment_pending_list(inputs)
	return en_attachment_pending_list(inputs)
});