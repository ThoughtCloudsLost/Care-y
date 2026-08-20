/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Login_PacingInputs */

const en_demo_flow_seam_login_pacing = /** @type {(inputs: Demo_Flow_Seam_Login_PacingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The pace of the login is scripted in the handbook. The real key derivation runs, with each callback held long enough to read.`)
};

const es_demo_flow_seam_login_pacing = /** @type {(inputs: Demo_Flow_Seam_Login_PacingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El ritmo del inicio de sesión está recreado en el manual. La derivación de claves real se ejecuta, con cada paso sostenido lo suficiente para leerlo.`)
};

/**
* | output |
* | --- |
* | "The pace of the login is scripted in the handbook. The real key derivation runs, with each callback held long enough to read." |
*
* @param {Demo_Flow_Seam_Login_PacingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_login_pacing = /** @type {((inputs?: Demo_Flow_Seam_Login_PacingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Login_PacingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_seam_login_pacing(inputs)
	return es_demo_flow_seam_login_pacing(inputs)
});