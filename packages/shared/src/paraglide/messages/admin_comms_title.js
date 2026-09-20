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

const en_xa2_admin_comms_title = /** @type {(inputs: Admin_Comms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmmùnìcàtìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Admin_Comms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_comms_title = /** @type {((inputs?: Admin_Comms_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Comms_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_comms_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_comms_title(inputs)
	return en_admin_comms_title(inputs)
});