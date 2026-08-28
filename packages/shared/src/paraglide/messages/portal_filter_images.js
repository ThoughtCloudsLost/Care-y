/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Filter_ImagesInputs */

const en_portal_filter_images = /** @type {(inputs: Portal_Filter_ImagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Images`)
};

const es_portal_filter_images = /** @type {(inputs: Portal_Filter_ImagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imágenes`)
};

/**
* | output |
* | --- |
* | "Images" |
*
* @param {Portal_Filter_ImagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_filter_images = /** @type {((inputs?: Portal_Filter_ImagesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Filter_ImagesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_filter_images(inputs)
	return es_portal_filter_images(inputs)
});