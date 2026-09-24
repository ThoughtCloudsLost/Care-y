/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Filter_FilesInputs */

const en_portal_filter_files = /** @type {(inputs: Portal_Filter_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files`)
};

const es_portal_filter_files = /** @type {(inputs: Portal_Filter_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos`)
};

const en_xa2_portal_filter_files = /** @type {(inputs: Portal_Filter_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìlès ••⟧`)
};

/**
* | output |
* | --- |
* | "Files" |
*
* @param {Portal_Filter_FilesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_filter_files = /** @type {((inputs?: Portal_Filter_FilesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Filter_FilesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_filter_files(inputs)
	if (locale === "en-XA") return en_xa2_portal_filter_files(inputs)
	return en_portal_filter_files(inputs)
});