/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Nudge_Sms_BodyInputs */

const en_portal_nudge_sms_body = /** @type {(inputs: Portal_Nudge_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You have a new message waiting for you.`)
};

const es_portal_nudge_sms_body = /** @type {(inputs: Portal_Nudge_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tienes un nuevo mensaje esperándote.`)
};

/**
* | output |
* | --- |
* | "You have a new message waiting for you." |
*
* @param {Portal_Nudge_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_nudge_sms_body = /** @type {((inputs?: Portal_Nudge_Sms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Nudge_Sms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_nudge_sms_body(inputs)
	return es_portal_nudge_sms_body(inputs)
});