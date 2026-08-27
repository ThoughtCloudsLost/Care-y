/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_Content_Editor_Image_No_KeyInputs */

const en_form_content_editor_image_no_key = /** @type {(inputs: Form_Content_Editor_Image_No_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image upload requires the organization key to be loaded`)
};

const es_form_content_editor_image_no_key = /** @type {(inputs: Form_Content_Editor_Image_No_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La carga de imágenes requiere que la clave de la organización esté cargada`)
};

/**
* | output |
* | --- |
* | "Image upload requires the organization key to be loaded" |
*
* @param {Form_Content_Editor_Image_No_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const form_content_editor_image_no_key = /** @type {((inputs?: Form_Content_Editor_Image_No_KeyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_Content_Editor_Image_No_KeyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_form_content_editor_image_no_key(inputs)
	return es_form_content_editor_image_no_key(inputs)
});