/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This is the core of how CARE-Y protects data and what makes it different from a system that simply encrypts a database.
After the password is processed and the second factor is verified, CARE-Y performs a key derivation step called a **threshold Oblivious Pseudorandom Function** with two independent servers hosted in separate countries. Neither server ever sees the password or the final key. Each one holds only a share of the key material, and both must participate for the derivation to succeed. The result is a master key from which all of the volunteer's encryption keys are derived.
**What this means in practice:**
- No single server compromise can reconstruct a volunteer's keys
- No legal order in any one country can force decryption
- An attacker would need to compromise both servers simultaneously, in two different legal jurisdictions, and also possess the volunteer's password and second factor
- Key shares are refreshed regularly, so a captured share from one period is useless in the next
Volunteers do not need to understand the cryptography to use CARE-Y, but organizations evaluating the system should know that this is the foundation everything else rests on.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este es el nucleo de como CARE-Y protege los datos y lo que lo diferencia de un sistema que simplemente cifra una base de datos.
Despues de procesar la contrasena y verificar el segundo factor, CARE-Y realiza un paso de derivacion de claves llamado **Funcion Pseudoaleatoria Oblivious con umbral** con dos servidores independientes alojados en paises separados. Ningun servidor ve nunca la contrasena ni la clave final. Cada uno posee solo una parte del material criptografico, y ambos deben participar para que la derivacion tenga exito. El resultado es una clave maestra de la cual se derivan todas las claves de cifrado del voluntario.
**Lo que esto significa en la practica:**
- Ningun compromiso de un solo servidor puede reconstruir las claves de un voluntario
- Ninguna orden legal en un solo pais puede forzar el descifrado
- Un atacante necesitaria comprometer ambos servidores simultaneamente, en dos jurisdicciones legales diferentes, y ademas poseer la contrasena y el segundo factor del voluntario
- Las partes de las claves se renuevan regularmente, por lo que una parte capturada de un periodo es inutil en el siguiente
Los voluntarios no necesitan entender la criptografia para usar CARE-Y, pero las organizaciones que evaluan el sistema deben saber que esta es la base sobre la que se apoya todo lo demas.`)
};

/**
* | output |
* | --- |
* | "This is the core of how CARE-Y protects data and what makes it different from a system that simply encrypts a database. After the password is processed and t..." |
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