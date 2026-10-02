/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Secure_Share_Step2Inputs */

const en_demo_guide_secure_share_step2 = /** @type {(inputs: Demo_Guide_Secure_Share_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the link as the recipient. The message appears in the browser.`)
};

const es_demo_guide_secure_share_step2 = /** @type {(inputs: Demo_Guide_Secure_Share_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el enlace como destinatario. El mensaje aparece en el navegador.`)
};

const en_xa2_demo_guide_secure_share_step2 = /** @type {(inputs: Demo_Guide_Secure_Share_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè lìnk às thè rècìpìènt. Thè mèssàgè àppèàrs ìn thè bròwsèr. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the link as the recipient. The message appears in the browser." |
*
* @param {Demo_Guide_Secure_Share_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step2 = /** @type {((inputs?: Demo_Guide_Secure_Share_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Secure_Share_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_secure_share_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_secure_share_step2(inputs)
	return en_demo_guide_secure_share_step2(inputs)
});