/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Reply_To_Client_TitleInputs */

const en_demo_guide_reply_to_client_title = /** @type {(inputs: Demo_Guide_Reply_To_Client_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply to a client`)
};

const es_demo_guide_reply_to_client_title = /** @type {(inputs: Demo_Guide_Reply_To_Client_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responder a un cliente`)
};

const en_xa2_demo_guide_reply_to_client_title = /** @type {(inputs: Demo_Guide_Reply_To_Client_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply tò à clìènt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reply to a client" |
*
* @param {Demo_Guide_Reply_To_Client_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_reply_to_client_title = /** @type {((inputs?: Demo_Guide_Reply_To_Client_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Reply_To_Client_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_reply_to_client_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_reply_to_client_title(inputs)
	return en_demo_guide_reply_to_client_title(inputs)
});