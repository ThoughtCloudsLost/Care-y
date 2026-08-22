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

/**
* | output |
* | --- |
* | "Select a feature from the list, scroll, or interact with the CARE-Y app in the simulator to learn more." |
*
* @param {Demo_Narrative_TipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tip = /** @type {((inputs?: Demo_Narrative_TipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_TipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_tip(inputs)
	return es_demo_narrative_tip(inputs)
});