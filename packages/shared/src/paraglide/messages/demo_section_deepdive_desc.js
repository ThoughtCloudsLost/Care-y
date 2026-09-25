/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Deepdive_DescInputs */

const en_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cross-cutting entries that cover the protection model in depth. They explain encryption, key derivation, the trust boundary, retention, permissions, the telephony relay and the portal channels, and feature entries link to them for the mechanisms behind what each screen shows.`)
};

const es_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entradas transversales que cubren el modelo de protección en profundidad. Explican el cifrado, la derivación de claves, la frontera de confianza, la retención, los permisos, el relay de telefonía y los canales del portal, y las entradas de funciones enlazan a ellas para conocer los mecanismos detrás de lo que muestra cada pantalla.`)
};

const en_xa2_demo_section_deepdive_desc = /** @type {(inputs: Demo_Section_Deepdive_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cròss-cùttìng èntrìès thàt còvèr thè pròtèctìòn mòdèl ìn dèpth. Thèy èxplàìn èncryptìòn, kèy dèrìvàtìòn, thè trùst bòùndàry, rètèntìòn, pèrmìssìòns, thè tèlèphòny rèlày ànd thè pòrtàl chànnèls, ànd fèàtùrè èntrìès lìnk tò thèm fòr thè mèchànìsms bèhìnd whàt èàch scrèèn shòws. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cross-cutting entries that cover the protection model in depth. They explain encryption, key derivation, the trust boundary, retention, permissions, the tele..." |
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