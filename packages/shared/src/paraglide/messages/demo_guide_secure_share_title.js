/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Secure_Share_TitleInputs */

const en_demo_guide_secure_share_title = /** @type {(inputs: Demo_Guide_Secure_Share_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send a secure link`)
};

const es_demo_guide_secure_share_title = /** @type {(inputs: Demo_Guide_Secure_Share_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar un enlace seguro`)
};

const en_xa2_demo_guide_secure_share_title = /** @type {(inputs: Demo_Guide_Secure_Share_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd à sècùrè lìnk ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send a secure link" |
*
* @param {Demo_Guide_Secure_Share_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_title = /** @type {((inputs?: Demo_Guide_Secure_Share_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Secure_Share_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_secure_share_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_secure_share_title(inputs)
	return en_demo_guide_secure_share_title(inputs)
});