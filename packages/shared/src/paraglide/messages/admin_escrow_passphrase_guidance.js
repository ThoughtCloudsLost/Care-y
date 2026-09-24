/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Passphrase_GuidanceInputs */

const en_admin_escrow_passphrase_guidance = /** @type {(inputs: Admin_Escrow_Passphrase_GuidanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use a long, memorable phrase. Example: four or more random words like 'morning river quiet lantern'. Longer is always better.`)
};

const es_admin_escrow_passphrase_guidance = /** @type {(inputs: Admin_Escrow_Passphrase_GuidanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use una frase larga y memorable. Ejemplo: cuatro o más palabras aleatorias como 'manana rio tranquilo farol'. Más larga siempre es mejor.`)
};

const en_xa2_admin_escrow_passphrase_guidance = /** @type {(inputs: Admin_Escrow_Passphrase_GuidanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsè à lòng, mèmòràblè phràsè. Èxàmplè: fòùr òr mòrè ràndòm wòrds lìkè 'mòrnìng rìvèr qùìèt làntèrn'. Lòngèr ìs àlwàys bèttèr. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Use a long, memorable phrase. Example: four or more random words like 'morning river quiet lantern'. Longer is always better." |
*
* @param {Admin_Escrow_Passphrase_GuidanceInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_guidance = /** @type {((inputs?: Admin_Escrow_Passphrase_GuidanceInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Passphrase_GuidanceInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_passphrase_guidance(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_passphrase_guidance(inputs)
	return en_admin_escrow_passphrase_guidance(inputs)
});