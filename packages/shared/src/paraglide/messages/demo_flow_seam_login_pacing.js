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

const en_xa2_demo_flow_seam_login_pacing = /** @type {(inputs: Demo_Flow_Seam_Login_PacingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pàcè òf thè lògìn ìs scrìptèd ìn thè hàndbòòk. Thè rèàl kèy dèrìvàtìòn rùns, wìth èàch càllbàck hèld lòng ènòùgh tò rèàd. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The pace of the login is scripted in the handbook. The real key derivation runs, with each callback held long enough to read." |
*
* @param {Demo_Flow_Seam_Login_PacingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_login_pacing = /** @type {((inputs?: Demo_Flow_Seam_Login_PacingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Login_PacingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_seam_login_pacing(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_seam_login_pacing(inputs)
	return en_demo_flow_seam_login_pacing(inputs)
});