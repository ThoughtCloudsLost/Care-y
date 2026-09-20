/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_ImagesInputs */

const en_ticket_filter_type_images = /** @type {(inputs: Ticket_Filter_Type_ImagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Images`)
};

const es_ticket_filter_type_images = /** @type {(inputs: Ticket_Filter_Type_ImagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imágenes`)
};

const en_xa2_ticket_filter_type_images = /** @type {(inputs: Ticket_Filter_Type_ImagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmàgès ••⟧`)
};

/**
* | output |
* | --- |
* | "Images" |
*
* @param {Ticket_Filter_Type_ImagesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_images = /** @type {((inputs?: Ticket_Filter_Type_ImagesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_ImagesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_images(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_images(inputs)
	return en_ticket_filter_type_images(inputs)
});