/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Webauthn_Crossplatform_DescInputs */

const en_twofa_webauthn_crossplatform_desc = /** @type {(inputs: Twofa_Webauthn_Crossplatform_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This uses a small physical gadget (often a USB stick, a key fob, or a tap card) to verify it's really you. When you log in, you plug it into your computer or hold it against your phone. It works because even if someone learns your password, they don't have this physical thing. It stays with you, like a house key on your keyring.`)
};

const es_twofa_webauthn_crossplatform_desc = /** @type {(inputs: Twofa_Webauthn_Crossplatform_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usa un pequeño dispositivo físico (generalmente una memoria USB, un llavero o una tarjeta de contacto) para verificar que eres tú. Al iniciar sesión, lo conectas a tu computadora o lo acercas a tu teléfono. Funciona porque aunque alguien conozca tu contraseña, no tiene este objeto físico. Se queda contigo, como una llave de casa en tu llavero.`)
};

const en_xa2_twofa_webauthn_crossplatform_desc = /** @type {(inputs: Twofa_Webauthn_Crossplatform_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs ùsès à smàll physìcàl gàdgèt (òftèn à ÙSB stìck, à kèy fòb, òr à tàp càrd) tò vèrìfy ìt's rèàlly yòù. Whèn yòù lòg ìn, yòù plùg ìt ìntò yòùr còmpùtèr òr hòld ìt àgàìnst yòùr phònè. Ìt wòrks bècàùsè èvèn ìf sòmèònè lèàrns yòùr pàsswòrd, thèy dòn't hàvè thìs physìcàl thìng. Ìt stàys wìth yòù, lìkè à hòùsè kèy òn yòùr kèyrìng. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This uses a small physical gadget (often a USB stick, a key fob, or a tap card) to verify it's really you. When you log in, you plug it into your computer or..." |
*
* @param {Twofa_Webauthn_Crossplatform_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_crossplatform_desc = /** @type {((inputs?: Twofa_Webauthn_Crossplatform_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Crossplatform_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_webauthn_crossplatform_desc(inputs)
	if (locale === "en-XA") return en_xa2_twofa_webauthn_crossplatform_desc(inputs)
	return en_twofa_webauthn_crossplatform_desc(inputs)
});