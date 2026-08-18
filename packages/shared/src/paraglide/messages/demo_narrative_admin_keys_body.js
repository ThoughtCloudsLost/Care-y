/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Keys_BodyInputs */

const en_demo_narrative_admin_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The keys section shows the organization key status and provides escrow export.
**Escrow.** The escrow flow creates a passphrase protected file (minimum 20 characters) containing the organization's secret key. The passphrase protects the key using Argon2id key derivation. The administrator downloads the file and stores it offline on a USB drive or other secure medium. This file is the recovery path if all volunteers lose access to their accounts simultaneously.
**Key rotation.** Administrators can rotate the organization key from this section.`)
};

const es_demo_narrative_admin_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La seccion de claves muestra el estado de la clave de la organizacion y ofrece exportacion de custodia.
**Custodia.** El flujo de custodia crea un archivo protegido con frase de paso (minimo 20 caracteres) que contiene la clave secreta de la organizacion. La frase de paso protege la clave usando derivacion de claves Argon2id. El administrador descarga el archivo y lo almacena sin conexion en una memoria USB u otro medio seguro. Este archivo es la via de recuperacion si todos los voluntarios pierden acceso a sus cuentas simultaneamente.
**Rotacion de claves.** Los administradores pueden rotar la clave de la organizacion desde esta seccion.`)
};

/**
* | output |
* | --- |
* | "The keys section shows the organization key status and provides escrow export. **Escrow.** The escrow flow creates a passphrase protected file (minimum 20 ch..." |
*
* @param {Demo_Narrative_Admin_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_keys_body = /** @type {((inputs?: Demo_Narrative_Admin_Keys_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Keys_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_keys_body(inputs)
	return es_demo_narrative_admin_keys_body(inputs)
});