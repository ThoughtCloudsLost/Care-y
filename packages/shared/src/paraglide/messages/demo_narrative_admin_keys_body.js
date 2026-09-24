/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Keys_BodyInputs */

const en_demo_narrative_admin_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The keys section reports the organization key status and provides two operations on it.
**Escrow.** The escrow file carries its own KDF parameters, salt, nonce, and ciphertext in base64, so it can be read on any machine without CARE-Y installed. The passphrase must be at least 20 characters, and the key derivation is Argon2id. The file's SHA-256 is shown in groups of four characters for visual comparison, and both the passphrase bytes and the organization's secret key are zeroed after the export whether or not it succeeded.
**Key rotation.** Rotation generates a new keypair in the browser, wraps the new secret key once per active user who holds a public key, and submits all wraps in one request. Users who are inactive or have never signed in receive no wrapped copy. On completion the browser fetches and unwraps the key through the normal sign in path rather than trusting the key it just generated, and the rotation dialog cannot be dismissed while the operation is in flight.
**Permissions.** Both escrow export and key rotation require the Manage keys permission.`)
};

const es_demo_narrative_admin_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de claves muestra el estado de la clave de la organización y ofrece dos operaciones sobre ella.
**Custodia.** El archivo de custodia lleva sus propios parámetros KDF, sal, nonce y texto cifrado en base64, de modo que se puede abrir en cualquier máquina sin CARE-Y instalado. La frase de paso debe tener al menos 20 caracteres, y la derivación de claves es Argon2id. El SHA-256 del archivo se muestra en grupos de cuatro caracteres para comparación visual, y tanto los bytes de la frase de paso como la clave secreta de la organización se borran después de la exportación haya tenido éxito o no.
**Rotación de claves.** La rotación genera un nuevo par de claves en el navegador, envuelve la nueva clave secreta una vez por cada persona activa que posee una clave pública y envía todos los envoltorios en una sola petición. Las personas inactivas o que nunca han iniciado sesión no reciben copia envuelta. Al completarse, el navegador obtiene y desenvuelve la clave por la vía normal de inicio de sesión en lugar de confiar en la clave que acaba de generar, y el diálogo de rotación no se puede cerrar mientras la operación está en curso.
**Permisos.** Tanto la exportación de custodia como la rotación de claves requieren el permiso Cuidar las claves de cifrado.`)
};

const en_xa2_demo_narrative_admin_keys_body = /** @type {(inputs: Demo_Narrative_Admin_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè kèys sèctìòn rèpòrts thè òrgànìzàtìòn kèy stàtùs ànd pròvìdès twò òpèràtìòns òn ìt.
 •••••••••••••••••••••••••••**Èscròw. •••** Thè èscròw fìlè càrrìès ìts òwn KDF pàràmètèrs, sàlt, nòncè, ànd cìphèrtèxt ìn bàsè64, sò ìt càn bè rèàd òn àny màchìnè wìthòùt CÀRÈ-Y ìnstàllèd. Thè pàssphràsè mùst bè àt lèàst 20 chàràctèrs, ànd thè kèy dèrìvàtìòn ìs Àrgòn2ìd. Thè fìlè's SHÀ-256 ìs shòwn ìn gròùps òf fòùr chàràctèrs fòr vìsùàl còmpàrìsòn, ànd bòth thè pàssphràsè bytès ànd thè òrgànìzàtìòn's sècrèt kèy àrè zèròèd àftèr thè èxpòrt whèthèr òr nòt ìt sùccèèdèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Kèy ròtàtìòn. ••••** Ròtàtìòn gènèràtès à nèw kèypàìr ìn thè bròwsèr, wràps thè nèw sècrèt kèy òncè pèr àctìvè ùsèr whò hòlds à pùblìc kèy, ànd sùbmìts àll wràps ìn ònè rèqùèst. Ùsèrs whò àrè ìnàctìvè òr hàvè nèvèr sìgnèd ìn rècèìvè nò wràppèd còpy. Òn còmplètìòn thè bròwsèr fètchès ànd ùnwràps thè kèy thròùgh thè nòrmàl sìgn ìn pàth ràthèr thàn trùstìng thè kèy ìt jùst gènèràtèd, ànd thè ròtàtìòn dìàlòg cànnòt bè dìsmìssèd whìlè thè òpèràtìòn ìs ìn flìght.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Bòth èscròw èxpòrt ànd kèy ròtàtìòn rèqùìrè thè Mànàgè kèys pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The keys section reports the organization key status and provides two operations on it. **Escrow.** The escrow file carries its own KDF parameters, salt, non..." |
*
* @param {Demo_Narrative_Admin_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_keys_body = /** @type {((inputs?: Demo_Narrative_Admin_Keys_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Keys_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_keys_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_keys_body(inputs)
	return en_demo_narrative_admin_keys_body(inputs)
});