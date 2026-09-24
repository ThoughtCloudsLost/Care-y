/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Phone_Frame_TitleInputs */

const en_demo_phone_frame_title = /** @type {(inputs: Demo_Phone_Frame_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y app handbook`)
};

const es_demo_phone_frame_title = /** @type {(inputs: Demo_Phone_Frame_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manual de la aplicación CARE-Y`)
};

const en_xa2_demo_phone_frame_title = /** @type {(inputs: Demo_Phone_Frame_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦CÀRÈ-Y àpp hàndbòòk ••••••⟧`)
};

/**
* | output |
* | --- |
* | "CARE-Y app handbook" |
*
* @param {Demo_Phone_Frame_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_phone_frame_title = /** @type {((inputs?: Demo_Phone_Frame_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Phone_Frame_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_phone_frame_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_phone_frame_title(inputs)
	return en_demo_phone_frame_title(inputs)
});