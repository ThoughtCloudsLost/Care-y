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

const en_xa2_followup_type_share_link = /** @type {(inputs: Followup_Type_Share_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrè lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Secure link" |
*
* @param {Followup_Type_Share_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_share_link = /** @type {((inputs?: Followup_Type_Share_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Share_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_share_link(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_share_link(inputs)
	return en_followup_type_share_link(inputs)
});