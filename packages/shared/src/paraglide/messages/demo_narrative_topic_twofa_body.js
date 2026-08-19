/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After entering a password, CARE-Y requires a second factor to verify the volunteer's identity before deriving encryption keys. A stolen or guessed password alone is not enough to access any data.
**Methods.** Six are supported, volunteers can enroll in more than one from the Settings page, and each method is described in its own section below.
**Enrollment guidance.** Organizations should encourage volunteers to enroll at least two methods so they have a fallback if one becomes unavailable, such as a lost phone or a new device.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Después de introducir la contraseña, CARE-Y requiere un segundo factor para verificar la identidad antes de derivar las claves de cifrado. Una contraseña robada o adivinada por sí sola no es suficiente para acceder a ningún dato.
**Métodos.** Se admiten seis, las personas voluntarias pueden registrarse en más de uno desde la página de Configuración, y cada método se describe en su propia sección a continuación.
**Guía de registro.** Las organizaciones deben animar a sus voluntarios a registrar al menos dos métodos para tener una alternativa si uno deja de estar disponible, como un teléfono perdido o un dispositivo nuevo.`)
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