/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After entering a password, CARE-Y requires a second factor to verify the volunteer's identity before deriving encryption keys. A stolen or guessed password alone is not enough to access any data.
**Six methods are supported.** Volunteers can enroll in more than one from the Settings page. Each method is described in its own section below.
**Organizations should encourage volunteers to enroll at least two methods** so they have a fallback if one becomes unavailable, such as a lost phone or a new device.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Despues de introducir la contrasena, CARE-Y requiere un segundo factor para verificar la identidad antes de derivar las claves de cifrado. Una contrasena robada o adivinada por si sola no es suficiente para acceder a ningun dato.
**Se admiten seis metodos.** Las personas voluntarias pueden registrarse en mas de uno desde la pagina de Configuracion. Cada metodo se describe en su propia seccion a continuacion.
**Las organizaciones deben animar a sus voluntarios a registrar al menos dos metodos** para tener una alternativa si uno deja de estar disponible, como un telefono perdido o un dispositivo nuevo.`)
};

/**
* | output |
* | --- |
* | "After entering a password, CARE-Y requires a second factor to verify the volunteer's identity before deriving encryption keys. A stolen or guessed password a..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_body(inputs)
	return es_demo_narrative_topic_twofa_body(inputs)
});