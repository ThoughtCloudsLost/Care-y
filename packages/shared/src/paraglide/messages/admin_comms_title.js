/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Comms_TitleInputs */

const en_admin_comms_title = /** @type {(inputs: Admin_Comms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Communications`)
};

const es_admin_comms_title = /** @type {(inputs: Admin_Comms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comunicaciones`)
};

/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Admin_Comms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_comms_title = /** @type {((inputs?: Admin_Comms_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Comms_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_comms_title(inputs)
	return es_admin_comms_title(inputs)
});