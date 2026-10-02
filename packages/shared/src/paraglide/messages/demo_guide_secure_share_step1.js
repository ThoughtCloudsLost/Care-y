/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Secure_Share_Step1Inputs */

const en_demo_guide_secure_share_step1 = /** @type {(inputs: Demo_Guide_Secure_Share_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open a ticket and tap Send secure link. Type the message and choose Send by SMS or Copy link.`)
};

const es_demo_guide_secure_share_step1 = /** @type {(inputs: Demo_Guide_Secure_Share_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre un ticket y toca Enviar enlace seguro. Escribe el mensaje y elige Enviar por SMS o Copiar enlace.`)
};

const en_xa2_demo_guide_secure_share_step1 = /** @type {(inputs: Demo_Guide_Secure_Share_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn à tìckèt ànd tàp Sènd sècùrè lìnk. Typè thè mèssàgè ànd chòòsè Sènd by SMS òr Còpy lìnk. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open a ticket and tap Send secure link. Type the message and choose Send by SMS or Copy link." |
*
* @param {Demo_Guide_Secure_Share_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step1 = /** @type {((inputs?: Demo_Guide_Secure_Share_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Secure_Share_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_secure_share_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_secure_share_step1(inputs)
	return en_demo_guide_secure_share_step1(inputs)
});