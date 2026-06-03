/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_ClientInputs */

const en_admin_terminology_desc_client = /** @type {(inputs: Admin_Terminology_Desc_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people your organization serves and supports.`)
};

const es_admin_terminology_desc_client = /** @type {(inputs: Admin_Terminology_Desc_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las personas a las que su organización sirve y apoya.`)
};

/**
* | output |
* | --- |
* | "The people your organization serves and supports." |
*
* @param {Admin_Terminology_Desc_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_client = /** @type {((inputs?: Admin_Terminology_Desc_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_client(inputs)
	return es_admin_terminology_desc_client(inputs)
});