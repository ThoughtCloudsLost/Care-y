/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ link: NonNullable<unknown> }} Portal_Link_Sms_BodyInputs */

const en_portal_link_sms_body = /** @type {(inputs: Portal_Link_Sms_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Here is your private message link: ${i?.link}`)
};

const es_portal_link_sms_body = /** @type {(inputs: Portal_Link_Sms_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Aquí está tu enlace privado de mensajes: ${i?.link}`)
};

/**
* | output |
* | --- |
* | "Here is your private message link: {link}" |
*
* @param {Portal_Link_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_link_sms_body = /** @type {((inputs: Portal_Link_Sms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Link_Sms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_link_sms_body(inputs)
	return es_portal_link_sms_body(inputs)
});