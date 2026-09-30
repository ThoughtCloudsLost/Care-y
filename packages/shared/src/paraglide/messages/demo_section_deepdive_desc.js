/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Deepdive_DescInputs */

const en_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The deep dives cover what CARE-Y is, encryption, key derivation, the organization key lifecycle, the trust boundary, deployment, verifying the code, what the network sees, what stays on the device, the permission system, the telephony relay, the portal channel lifecycle and data retention. Feature entries throughout the handbook link here for mechanism details they reference but do not repeat.`)
};

const es_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las entradas de esta sección cubren qué es CARE-Y, el cifrado, la derivación de claves, el ciclo de vida de la clave de la organización, la frontera de confianza, el despliegue, la verificación del código, lo que ve la red, lo que queda en el dispositivo, el sistema de permisos, el relay de telefonía, el ciclo de vida del canal del portal y la retención de datos. Las entradas de funciones en todo el manual enlazan aquí para los detalles de mecanismo que referencian pero no repiten.`)
};

const en_xa2_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dèèp dìvès còvèr whàt CÀRÈ-Y ìs, èncryptìòn, kèy dèrìvàtìòn, thè òrgànìzàtìòn kèy lìfècyclè, thè trùst bòùndàry, dèplòymènt, vèrìfyìng thè còdè, whàt thè nètwòrk sèès, whàt stàys òn thè dèvìcè, thè pèrmìssìòn systèm, thè tèlèphòny rèlày, thè pòrtàl chànnèl lìfècyclè ànd dàtà rètèntìòn. Fèàtùrè èntrìès thròùghòùt thè hàndbòòk lìnk hèrè fòr mèchànìsm dètàìls thèy rèfèrèncè bùt dò nòt rèpèàt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The deep dives cover what CARE-Y is, encryption, key derivation, the organization key lifecycle, the trust boundary, deployment, verifying the code, what the..." |
*
* @param {Demo_Section_Deepdive_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_deepdive_desc = /** @type {((inputs?: Demo_Section_Deepdive_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Deepdive_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_deepdive_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_deepdive_desc(inputs)
	return en_demo_section_deepdive_desc(inputs)
});