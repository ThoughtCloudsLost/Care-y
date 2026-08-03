/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_TipInputs */

const en_demo_narrative_tip = /** @type {(inputs: Demo_Narrative_TipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a feature from the list, scroll down, or interact with the CARE-Y app in the phone to learn more about what it can do.`)
};

const es_demo_narrative_tip = /** @type {(inputs: Demo_Narrative_TipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona una funcion de la lista, desplazate hacia abajo o interactua con la aplicacion CARE-Y en el telefono para conocer lo que puede hacer.`)
};

/**
* | output |
* | --- |
* | "Select a feature from the list, scroll down, or interact with the CARE-Y app in the phone to learn more about what it can do." |
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