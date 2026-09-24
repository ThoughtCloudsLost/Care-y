/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Diagram_ZoomInputs */

const en_onboarding_briefing_diagram_zoom = /** @type {(inputs: Onboarding_Briefing_Diagram_ZoomInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pinch to zoom, tap background to close`)
};

const es_onboarding_briefing_diagram_zoom = /** @type {(inputs: Onboarding_Briefing_Diagram_ZoomInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pellizca para zoom, toca el fondo para cerrar`)
};

const en_xa2_onboarding_briefing_diagram_zoom = /** @type {(inputs: Onboarding_Briefing_Diagram_ZoomInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pìnch tò zòòm, tàp bàckgròùnd tò clòsè ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Pinch to zoom, tap background to close" |
*
* @param {Onboarding_Briefing_Diagram_ZoomInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_diagram_zoom = /** @type {((inputs?: Onboarding_Briefing_Diagram_ZoomInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Diagram_ZoomInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_diagram_zoom(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_diagram_zoom(inputs)
	return en_onboarding_briefing_diagram_zoom(inputs)
});