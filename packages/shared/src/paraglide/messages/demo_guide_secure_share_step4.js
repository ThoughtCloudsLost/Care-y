/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Secure_Share_Step4Inputs */

const en_demo_guide_secure_share_step4 = /** @type {(inputs: Demo_Guide_Secure_Share_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Return to the ticket and check the share status line. It reads Waiting, Opened, or Expired.`)
};

const es_demo_guide_secure_share_step4 = /** @type {(inputs: Demo_Guide_Secure_Share_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vuelve al ticket y revisa la línea de estado del enlace. Muestra Pendiente, Abierto o Expirado.`)
};

const en_xa2_demo_guide_secure_share_step4 = /** @type {(inputs: Demo_Guide_Secure_Share_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètùrn tò thè tìckèt ànd chèck thè shàrè stàtùs lìnè. Ìt rèàds Wàìtìng, Òpènèd, òr Èxpìrèd. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Return to the ticket and check the share status line. It reads Waiting, Opened, or Expired." |
*
* @param {Demo_Guide_Secure_Share_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step4 = /** @type {((inputs?: Demo_Guide_Secure_Share_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Secure_Share_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_secure_share_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_secure_share_step4(inputs)
	return en_demo_guide_secure_share_step4(inputs)
});