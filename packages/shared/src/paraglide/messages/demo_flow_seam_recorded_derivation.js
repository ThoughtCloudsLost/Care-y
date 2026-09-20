/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Recorded_DerivationInputs */

const en_demo_flow_seam_recorded_derivation = /** @type {(inputs: Demo_Flow_Seam_Recorded_DerivationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This server exchange ran once when the handbook started. It is replayed here with its real measured timing so the login section shows the full round-trip sequence.`)
};

const es_demo_flow_seam_recorded_derivation = /** @type {(inputs: Demo_Flow_Seam_Recorded_DerivationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este intercambio con el servidor se ejecutó una vez al iniciar el manual. Se reproduce aquí con su duración real medida para que la sección de inicio de sesión muestre la secuencia completa de ida y vuelta.`)
};

const en_xa2_demo_flow_seam_recorded_derivation = /** @type {(inputs: Demo_Flow_Seam_Recorded_DerivationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sèrvèr èxchàngè ràn òncè whèn thè hàndbòòk stàrtèd. Ìt ìs rèplàyèd hèrè wìth ìts rèàl mèàsùrèd tìmìng sò thè lògìn sèctìòn shòws thè fùll ròùnd-trìp sèqùèncè. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This server exchange ran once when the handbook started. It is replayed here with its real measured timing so the login section shows the full round-trip seq..." |
*
* @param {Demo_Flow_Seam_Recorded_DerivationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_recorded_derivation = /** @type {((inputs?: Demo_Flow_Seam_Recorded_DerivationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Recorded_DerivationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_seam_recorded_derivation(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_seam_recorded_derivation(inputs)
	return en_demo_flow_seam_recorded_derivation(inputs)
});