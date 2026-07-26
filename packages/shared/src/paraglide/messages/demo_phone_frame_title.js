/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Phone_Frame_TitleInputs */

const en_demo_phone_frame_title = /** @type {(inputs: Demo_Phone_Frame_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y app demo`)
};

const es_demo_phone_frame_title = /** @type {(inputs: Demo_Phone_Frame_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demo de la aplicación CARE-Y`)
};

/**
* | output |
* | --- |
* | "CARE-Y app demo" |
*
* @param {Demo_Phone_Frame_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_phone_frame_title = /** @type {((inputs?: Demo_Phone_Frame_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Phone_Frame_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_phone_frame_title(inputs)
	return es_demo_phone_frame_title(inputs)
});