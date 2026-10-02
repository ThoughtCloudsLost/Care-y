/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Secure_Share_Step3Inputs */

const en_demo_guide_secure_share_step3 = /** @type {(inputs: Demo_Guide_Secure_Share_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the same link again. The page shows an already-opened state.`)
};

const es_demo_guide_secure_share_step3 = /** @type {(inputs: Demo_Guide_Secure_Share_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el mismo enlace otra vez. La página muestra un estado de ya abierto.`)
};

const en_xa2_demo_guide_secure_share_step3 = /** @type {(inputs: Demo_Guide_Secure_Share_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè sàmè lìnk àgàìn. Thè pàgè shòws àn àlrèàdy-òpènèd stàtè. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the same link again. The page shows an already-opened state." |
*
* @param {Demo_Guide_Secure_Share_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step3 = /** @type {((inputs?: Demo_Guide_Secure_Share_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Secure_Share_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_secure_share_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_secure_share_step3(inputs)
	return en_demo_guide_secure_share_step3(inputs)
});