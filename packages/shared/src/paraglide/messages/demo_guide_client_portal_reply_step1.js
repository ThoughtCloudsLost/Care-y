/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Portal_Reply_Step1Inputs */

const en_demo_guide_client_portal_reply_step1 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the portal link. If it carries a passphrase, enter the words given on the call.`)
};

const es_demo_guide_client_portal_reply_step1 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el enlace del portal. Si tiene frase de acceso, ingresa las palabras que te dieron en la llamada.`)
};

const en_xa2_demo_guide_client_portal_reply_step1 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè pòrtàl lìnk. Ìf ìt càrrìès à pàssphràsè, èntèr thè wòrds gìvèn òn thè càll. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the portal link. If it carries a passphrase, enter the words given on the call." |
*
* @param {Demo_Guide_Client_Portal_Reply_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_portal_reply_step1 = /** @type {((inputs?: Demo_Guide_Client_Portal_Reply_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Portal_Reply_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_portal_reply_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_portal_reply_step1(inputs)
	return en_demo_guide_client_portal_reply_step1(inputs)
});