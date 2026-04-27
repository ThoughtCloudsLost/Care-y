/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_FilesInputs */

const en_ticket_filter_type_files = /** @type {(inputs: Ticket_Filter_Type_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files`)
};

const es_ticket_filter_type_files = /** @type {(inputs: Ticket_Filter_Type_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos`)
};

/**
* | output |
* | --- |
* | "Files" |
*
* @param {Ticket_Filter_Type_FilesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_files = /** @type {((inputs?: Ticket_Filter_Type_FilesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_FilesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_files(inputs)
	return es_ticket_filter_type_files(inputs)
});