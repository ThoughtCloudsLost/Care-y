/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Portal_Reply_TitleInputs */

const en_demo_guide_client_portal_reply_title = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply from the client portal`)
};

const es_demo_guide_client_portal_reply_title = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responder desde el portal del cliente`)
};

const en_xa2_demo_guide_client_portal_reply_title = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply fròm thè clìènt pòrtàl •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reply from the client portal" |
*
* @param {Demo_Guide_Client_Portal_Reply_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_portal_reply_title = /** @type {((inputs?: Demo_Guide_Client_Portal_Reply_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Portal_Reply_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_portal_reply_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_portal_reply_title(inputs)
	return en_demo_guide_client_portal_reply_title(inputs)
});