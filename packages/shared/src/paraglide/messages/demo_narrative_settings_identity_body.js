/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Identity_BodyInputs */

const en_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account carries a display name that other accounts see on its work and a username that signs it in, and the two are held under different protections because the server has to act on one of them. Changing the username also takes the current password; changing the display name does not. [[#privacy #server-holds]]
**What the server holds of a display name.** The browser seals the new name to the organization's public key before it leaves, so the server writes a box it cannot open onto the account row, and every surface that shows a name opens that box in the browser. An account with permission to manage users can change another account's display name the same way, from its own browser, with the same seal. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds]]
**Why a username passes through the server in the clear.** The change sends the username itself, because the value a sign-in matches against is a keyed hash of it that only the server can compute, salted with the organization identifier so the same username in two organizations produces two different values. The server computes that hash, seals its own copy of the name for the browser to read back, and keeps no plaintext column. A change and an account creation are the two moments a username is legible to the server. [Username and password](#login/credentials) covers the sign-in side. [[#server-holds #metadata]]
**What the stored lookup value allows.** It is deterministic within an organization, so someone holding the database can test a guessed username against it and learn whether that guess belongs to an account, and cannot run it backwards into a name. A username taken from a legal name or an email address is confirmable that way, and one that is tied to no person is not. [[#metadata #privacy]]
**What a refusal says.** A username already taken is refused on the self-service path with the same wording as any other failure, so an attempt is not a way to test names. An administrator changing someone else's username is told about the conflict directly, and is refused on their own account, which leaves the path that asks for a password as the only route to it. [[#failure-states #permissions]]
**The profile mutations and the columns.** Both changes are mutations in \`packages/server/src/routes/profile.ts\` over \`updateDisplayName\` and \`updateUsername\` in \`packages/server/src/auth/service.ts\`. The columns are \`users.encrypted_display_name\`, \`users.encrypted_identifier\` and \`users.identifier_hash\` from \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, and the keyed hash is \`hashIdentifier\` in \`packages/server/src/crypto/field-encryptor.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta lleva un nombre visible que las demás cuentas ven en su trabajo y un nombre de usuario con el que inicia sesión, y los dos se guardan con protecciones distintas porque el servidor tiene que operar con uno de ellos. Cambiar el nombre de usuario exige además la contraseña actual; cambiar el nombre visible, no. [[#privacy #server-holds]]
**Lo que el servidor guarda de un nombre visible.** El navegador sella el nombre nuevo con la clave pública de la organización antes de enviarlo, así que el servidor escribe en la fila de la cuenta una caja que no puede abrir, y cada superficie que muestra un nombre abre esa caja en el navegador. Una cuenta con permiso para gestionar personas usuarias puede cambiar el nombre visible de otra cuenta de la misma manera, desde su propio navegador y con el mismo sellado. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#encryption #server-holds]]
**Por qué un nombre de usuario pasa en claro por el servidor.** El cambio envía el nombre de usuario en sí, porque el valor con el que se compara un inicio de sesión es un hash con clave que solo el servidor puede calcular, salado con el identificador de la organización para que el mismo nombre en dos organizaciones produzca dos valores distintos. El servidor calcula ese hash, sella su propia copia del nombre para que el navegador la lea después y no conserva ninguna columna en claro. Un cambio y la creación de la cuenta son los dos momentos en que un nombre de usuario resulta legible para el servidor. [Nombre de usuario y contraseña](#login/credentials) trata el lado del inicio de sesión. [[#server-holds #metadata]]
**Qué permite el valor de búsqueda almacenado.** Es determinista dentro de una organización, de modo que quien tenga la base de datos puede probar un nombre de usuario adivinado contra él y averiguar si esa conjetura corresponde a una cuenta, y no puede recorrerlo al revés hasta el nombre. Un nombre de usuario tomado de un nombre legal o de una dirección de correo se puede confirmar así, y uno que no esté ligado a ninguna persona no. [[#metadata #privacy]]
**Qué dice un rechazo.** Un nombre de usuario ya ocupado se rechaza en la ruta de autoservicio con la misma redacción que cualquier otro fallo, así que un intento no sirve para probar nombres. A quien administra y cambia el nombre de usuario de otra persona se le indica el conflicto directamente, y se le rechaza sobre su propia cuenta, lo que deja la ruta que pide contraseña como la única vía. [[#failure-states #permissions]]
**Las mutaciones de perfil y las columnas.** Los dos cambios son mutaciones de \`packages/server/src/routes/profile.ts\` sobre \`updateDisplayName\` y \`updateUsername\`, en \`packages/server/src/auth/service.ts\`. Las columnas son \`users.encrypted_display_name\`, \`users.encrypted_identifier\` y \`users.identifier_hash\`, de \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, y el hash con clave es \`hashIdentifier\`, en \`packages/server/src/crypto/field-encryptor.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦**Dìsplày nàmè. ••••** Thè dìsplày nàmè ìs èncryptèd wìth thè òrgànìzàtìòn kèy ìn thè bròwsèr bèfòrè bèìng sènt tò thè sèrvèr.
 ••••••••••••••••••••••••••••••••**Ùsèrnàmè. •••** Thè ùsèrnàmè ìs sènt tò thè sèrvèr ìn plàìntèxt (pròtèctèd by TLS ìn trànsìt) bècàùsè ìt ìs ùsèd fòr àùthèntìcàtìòn lòòkùp, ànd thè sèrvèr rè-èncrypts ìt òn rècèìpt. ••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account carries a display name that other accounts see on its work and a username that signs it in, and the two are held under different protections becau..." |
*
* @param {Demo_Narrative_Settings_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_body = /** @type {((inputs?: Demo_Narrative_Settings_Identity_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Identity_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_identity_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_identity_body(inputs)
	return en_demo_narrative_settings_identity_body(inputs)
});