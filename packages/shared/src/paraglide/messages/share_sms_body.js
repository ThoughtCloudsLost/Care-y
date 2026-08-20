/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ url: NonNullable<unknown> }} Share_Sms_BodyInputs */

const en_share_sms_body = /** @type {(inputs: Share_Sms_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You have a secure message: ${i?.url}`)
};

const es_share_sms_body = /** @type {(inputs: Share_Sms_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tienes un mensaje seguro: ${i?.url}`)
};

/**
* | output |
* | --- |
* | "You have a secure message: {url}" |
*
* @param {Share_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sms_body = /** @type {((inputs: Share_Sms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sms_body(inputs)
	return es_share_sms_body(inputs)
});