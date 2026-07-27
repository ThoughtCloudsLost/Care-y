/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This is the core of the security model. After Argon2id stretching and two-factor verification, CARE-Y performs a threshold Oblivious Pseudorandom Function (OPRF) with two independent servers in separate jurisdictions. Neither server ever sees your password or the final key. Each holds only a share. The combined output produces your master key, from which all encryption keys are derived. No server, no single compromise, and no subpoena in any one jurisdiction can reconstruct your keys.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este es el nucleo del modelo de seguridad. Despues del estiramiento con Argon2id y la verificacion de dos factores, CARE-Y realiza una Funcion Pseudoaleatoria Oblivious (OPRF) con umbral, usando dos servidores independientes en jurisdicciones separadas. Ningun servidor ve tu contrasena ni la clave final. Cada uno solo posee una parte. La salida combinada produce tu clave maestra, de la cual se derivan todas las claves de cifrado. Ningun servidor, ningun compromiso individual, y ninguna orden judicial en una sola jurisdiccion puede reconstruir tus claves.`)
};

/**
* | output |
* | --- |
* | "This is the core of the security model. After Argon2id stretching and two-factor verification, CARE-Y performs a threshold Oblivious Pseudorandom Function (O..." |
*
* @param {Demo_Narrative_Topic_Key_Derivation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_body = /** @type {((inputs?: Demo_Narrative_Topic_Key_Derivation_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Key_Derivation_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_key_derivation_body(inputs)
	return es_demo_narrative_topic_key_derivation_body(inputs)
});