/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Share_LinkInputs */

const en_followup_type_share_link = /** @type {(inputs: Followup_Type_Share_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure link`)
};

const es_followup_type_share_link = /** @type {(inputs: Followup_Type_Share_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro`)
};

/**
* | output |
* | --- |
* | "Secure link" |
*
* @param {Followup_Type_Share_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_share_link = /** @type {((inputs?: Followup_Type_Share_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Share_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_share_link(inputs)
	return es_followup_type_share_link(inputs)
});