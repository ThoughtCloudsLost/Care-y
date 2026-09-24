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

const en_xa2_panel_quarantine = /** @type {(inputs: Panel_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnròùtèd Vòìcèmàìls ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unrouted Voicemails" |
*
* @param {Panel_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_quarantine = /** @type {((inputs?: Panel_QuarantineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_QuarantineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_quarantine(inputs)
	if (locale === "en-XA") return en_xa2_panel_quarantine(inputs)
	return en_panel_quarantine(inputs)
});