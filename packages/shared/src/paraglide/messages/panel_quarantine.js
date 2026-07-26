/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_QuarantineInputs */

const en_panel_quarantine = /** @type {(inputs: Panel_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unrouted Voicemails`)
};

const es_panel_quarantine = /** @type {(inputs: Panel_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes sin ruta`)
};

/**
* | output |
* | --- |
* | "Unrouted Voicemails" |
*
* @param {Panel_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_quarantine = /** @type {((inputs?: Panel_QuarantineInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_QuarantineInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_quarantine(inputs)
	return es_panel_quarantine(inputs)
});