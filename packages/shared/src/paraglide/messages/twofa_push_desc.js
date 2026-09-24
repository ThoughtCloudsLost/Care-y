/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_DescInputs */

const en_twofa_push_desc = /** @type {(inputs: Twofa_Push_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A notification pops up on your phone asking you to approve the login. You just tap "Yes, that's me" to get in. It works because someone would need access to your phone to tap that button. Requires the app to be installed and an internet connection on your phone.`)
};

const es_twofa_push_desc = /** @type {(inputs: Twofa_Push_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una notificación aparece en tu teléfono pidiéndote que apruebes el inicio de sesión. Solo tienes que tocar "Sí, soy yo" para entrar. Funciona porque alguien necesitaría acceso a tu teléfono para tocar ese botón. Requiere que la aplicación esté instalada y conexión a internet en tu teléfono.`)
};

const en_xa2_twofa_push_desc = /** @type {(inputs: Twofa_Push_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À nòtìfìcàtìòn pòps ùp òn yòùr phònè àskìng yòù tò àppròvè thè lògìn. Yòù jùst tàp "Yès, thàt's mè" tò gèt ìn. Ìt wòrks bècàùsè sòmèònè wòùld nèèd àccèss tò yòùr phònè tò tàp thàt bùttòn. Rèqùìrès thè àpp tò bè ìnstàllèd ànd àn ìntèrnèt cònnèctìòn òn yòùr phònè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A notification pops up on your phone asking you to approve the login. You just tap \"Yes, that's me\" to get in. It works because someone would need access to ..." |
*
* @param {Twofa_Push_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_desc = /** @type {((inputs?: Twofa_Push_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_desc(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_desc(inputs)
	return en_twofa_push_desc(inputs)
});