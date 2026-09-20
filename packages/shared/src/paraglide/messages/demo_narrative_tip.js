/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_TipInputs */

const en_demo_narrative_tip = /** @type {(inputs: Demo_Narrative_TipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a feature from the list, scroll, or interact with the CARE-Y app in the simulator to learn more.`)
};

const es_demo_narrative_tip = /** @type {(inputs: Demo_Narrative_TipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona una función de la lista, desplázate, o interactúa con la aplicación CARE-Y en el simulador para conocer más.`)
};

const en_xa2_demo_narrative_tip = /** @type {(inputs: Demo_Narrative_TipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct à fèàtùrè fròm thè lìst, scròll, òr ìntèràct wìth thè CÀRÈ-Y àpp ìn thè sìmùlàtòr tò lèàrn mòrè. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select a feature from the list, scroll, or interact with the CARE-Y app in the simulator to learn more." |
*
* @param {Demo_Narrative_TipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tip = /** @type {((inputs?: Demo_Narrative_TipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_TipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_tip(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_tip(inputs)
	return en_demo_narrative_tip(inputs)
});